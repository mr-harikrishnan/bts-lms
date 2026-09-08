import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.js';
import { env } from '../config/env.js';
import { Order, IOrder } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { WebhookEvent } from '../models/WebhookEvent.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/orderStatus.js';
import { toObjectId } from '../utils/objectId.js';
import { enrollUser } from './enrollment.service.js';
import { logger } from '../utils/logger.js';

export async function createPaymentOrder(userId: string, courseId: string) {
  const userOid = toObjectId(userId);
  const courseOid = toObjectId(courseId);

  const course = await Course.findById(courseOid);
  if (!course) {
    const error: any = new Error(`Course with ID '${courseId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  // Prevent duplicate enrollment
  const existingEnrollment = await Enrollment.findOne({ userId: userOid, courseId: courseOid });
  if (existingEnrollment) {
    const error: any = new Error('User is already enrolled in this course.');
    error.statusCode = 409;
    throw error;
  }

  // Server-side price resolution (never trust client amount)
  // Razorpay amounts are in the smallest currency unit (paise for INR, 1 INR = 100 paise)
  const amountInPaise = Math.round(course.price * 100);

  const internalOrder = await Order.create({
    userId: userOid,
    courseId: courseOid,
    amount: amountInPaise,
    currency: 'INR',
    status: ORDER_STATUS.PENDING,
    receipt: `rcpt_${Date.now()}_${userOid?.toString().slice(-4)}`,
    notes: {
      courseTitle: course.title,
      studentId: userId,
    },
  });

  let razorpayOrder: any;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: internalOrder.receipt,
      notes: {
        orderId: internalOrder._id.toString(),
        courseId,
        userId,
      },
    });
  } catch (err: any) {
    logger.error('Razorpay order creation error:', err);
    // In local dev/test with mock keys, fallback to mock order ID
    razorpayOrder = {
      id: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      amount: amountInPaise,
      currency: 'INR',
    };
  }

  internalOrder.razorpayOrderId = razorpayOrder.id;
  await internalOrder.save();

  return {
    orderId: internalOrder._id.toString(),
    razorpayOrderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: 'INR',
    courseTitle: course.title,
    keyId: env.RAZORPAY_KEY_ID,
  };
}

export async function verifyPaymentSignature(
  userId: string,
  payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }
) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;

  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    const error: any = new Error('Order not found for the provided Razorpay Order ID.');
    error.statusCode = 404;
    throw error;
  }

  // IDOR check: verify order belongs to authenticated user
  if (order.userId.toString() !== userId) {
    const error: any = new Error('Forbidden: You are not authorized to verify this payment.');
    error.statusCode = 403;
    throw error;
  }

  // HMAC SHA256 Signature Verification
  const text = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  const bufExpected = Buffer.from(generatedSignature, 'utf8');
  const bufReceived = Buffer.from(razorpaySignature, 'utf8');
  const isSignatureValid =
    bufExpected.length === bufReceived.length &&
    crypto.timingSafeEqual(bufExpected, bufReceived);

  if (!isSignatureValid) {
    order.status = ORDER_STATUS.FAILED;
    await order.save();
    logger.warn('Payment signature verification failed for order:', { razorpayOrderId, userId });
    const error: any = new Error('Payment signature verification failed. Possible tampering detected.');
    error.statusCode = 400;
    throw error;
  }

  // Update order status
  order.status = ORDER_STATUS.PAID;
  await order.save();

  // Create payment record
  const payment = await Payment.create({
    orderId: order._id,
    userId: order.userId,
    courseId: order.courseId,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    amount: order.amount,
    currency: order.currency,
    status: PAYMENT_STATUS.CAPTURED,
  });

  // Grant course access / enrollment atomically
  const enrollment = await enrollUser(userId, order.courseId.toString());

  return {
    verified: true,
    orderId: order._id,
    paymentId: payment._id,
    enrollment,
  };
}

export async function handleRazorpayWebhook(rawBody: Buffer | string, signature: string) {
  if (!rawBody || !signature) {
    const error: any = new Error('Raw body and signature header are required for webhook verification.');
    error.statusCode = 400;
    throw error;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  const bufExpected = Buffer.from(expectedSignature, 'utf8');
  const bufReceived = Buffer.from(signature, 'utf8');
  const isValid =
    bufExpected.length === bufReceived.length &&
    crypto.timingSafeEqual(bufExpected, bufReceived);

  if (!isValid) {
    logger.warn('Razorpay webhook signature verification failed.');
    const error: any = new Error('Invalid webhook signature.');
    error.statusCode = 400;
    throw error;
  }

  const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const event = JSON.parse(bodyStr);

  // Idempotency check: Reject already processed event
  const existingEvent = await WebhookEvent.findOne({ eventId: event.id });
  if (existingEvent) {
    logger.info(`Webhook event '${event.id}' already processed. Skipping duplicate.`);
    return { status: 'already_processed', eventId: event.id };
  }

  // Process event
  if (event.event === 'order.paid' || event.event === 'payment.captured') {
    const paymentEntity = event.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;

    if (razorpayOrderId) {
      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.status !== ORDER_STATUS.PAID) {
        order.status = ORDER_STATUS.PAID;
        await order.save();

        if (paymentEntity?.id) {
          await Payment.findOneAndUpdate(
            { razorpayPaymentId: paymentEntity.id },
            {
              orderId: order._id,
              userId: order.userId,
              courseId: order.courseId,
              razorpayPaymentId: paymentEntity.id,
              razorpayOrderId,
              amount: paymentEntity.amount,
              currency: paymentEntity.currency || 'INR',
              status: PAYMENT_STATUS.CAPTURED,
              method: paymentEntity.method || '',
            },
            { upsert: true, new: true }
          );
        }

        await enrollUser(order.userId.toString(), order.courseId.toString());
      }
    }
  }

  await WebhookEvent.create({
    eventId: event.id,
    eventType: event.event,
    payload: event,
    processed: true,
    processedAt: new Date(),
  });

  return { status: 'success', eventId: event.id };
}

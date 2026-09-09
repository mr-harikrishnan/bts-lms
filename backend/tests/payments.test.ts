import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import crypto from 'crypto';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { Course } from '../src/models/Course.js';
import { Order } from '../src/models/Order.js';
import { Payment } from '../src/models/Payment.js';
import { Enrollment } from '../src/models/Enrollment.js';
import { WebhookEvent } from '../src/models/WebhookEvent.js';
import { ROLES } from '../src/constants/roles.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../src/constants/orderStatus.js';
import { generateAccessToken } from '../src/utils/token.js';
import { env } from '../src/config/env.js';
import { razorpayInstance } from '../src/config/razorpay.js';
import mongoose from 'mongoose';

describe('Razorpay Payment Security & Order Flow Tests', () => {
  let student: any;
  let studentToken: string;
  let testCourse: any;

  before(async () => {
    await connectDatabase();

    razorpayInstance.orders.create = (async (options: any) => {
      return {
        id: `order_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
      };
    }) as any;

    student = await User.create({
      name: 'Payment Student',
      email: 'payment.student@test.com',
      password: 'hashedPassword123',

      role: ROLES.STUDENT,
    });

    studentToken = generateAccessToken({
      userId: student._id.toString(),
      email: student.email,
      role: student.role,
    });

    testCourse = await Course.create({
      title: 'Full-Stack Testing Course',
      category: 'Web Development',
      level: 'Advanced',
      duration: '4 Weeks',
      price: 1499,
      originalPrice: 2999,
      description: 'Test description',
      thumbnail: 'thumb.jpg',
      instructor: { name: 'Inst', title: 'Lead', avatar: 'av.jpg' },
    });
  });

  after(async () => {
    await User.deleteMany({ email: 'payment.student@test.com' });
    if (testCourse) {
      await Course.findByIdAndDelete(testCourse._id);
    }
    await Order.deleteMany({ userId: student._id });
    await Payment.deleteMany({ userId: student._id });
    await Enrollment.deleteMany({ userId: student._id });
    await WebhookEvent.deleteMany({ eventId: { $regex: /^test_evt_/ } });
    await disconnectDatabase();
  });

  test('POST /api/v1/payments/orders should resolve price server-side (ignores client amount tampering)', async () => {
    const res = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        courseId: testCourse._id.toString(),
        amount: 1, // Tampered client amount attempt
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    // Verified: Amount must be course.price * 100 paise (149900), NOT 1 paise!
    assert.strictEqual(res.body.data.amount, 149900);
    assert.ok(res.body.data.razorpayOrderId);
  });

  test('POST /api/v1/payments/verify should reject forged HMAC signature with 400 Bad Request', async () => {
    // Create an order first
    const orderRes = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId: testCourse._id.toString() });

    const razorpayOrderId = orderRes.body.data.razorpayOrderId;
    const fakePaymentId = 'pay_fake_12345';
    const fakeSignature = 'bad_forged_hmac_signature_hex';

    const verifyRes = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        razorpayOrderId,
        razorpayPaymentId: fakePaymentId,
        razorpaySignature: fakeSignature,
      });

    assert.strictEqual(verifyRes.status, 400);
    assert.strictEqual(verifyRes.body.success, false);

    // Verify enrollment was NOT created
    const enrollment = await Enrollment.findOne({ userId: student._id, courseId: testCourse._id });
    assert.strictEqual(enrollment, null);
  });

  test('POST /api/v1/payments/verify should succeed with authentic HMAC SHA-256 signature', async () => {
    // Clean any prior enrollment
    await Enrollment.deleteMany({ userId: student._id, courseId: testCourse._id });

    const orderRes = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId: testCourse._id.toString() });

    const razorpayOrderId = orderRes.body.data.razorpayOrderId;
    const validPaymentId = `pay_${Date.now()}`;

    // Compute legitimate HMAC SHA-256 signature using secret
    const text = `${razorpayOrderId}|${validPaymentId}`;
    const validSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    const verifyRes = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        razorpayOrderId,
        razorpayPaymentId: validPaymentId,
        razorpaySignature: validSignature,
      });

    assert.strictEqual(verifyRes.status, 200);
    assert.strictEqual(verifyRes.body.success, true);
    assert.strictEqual(verifyRes.body.data.verified, true);

    // Verify enrollment WAS granted
    const enrollment = await Enrollment.findOne({ userId: student._id, courseId: testCourse._id });
    assert.ok(enrollment);
  });

  test('POST /api/v1/payments/razorpay/webhook should enforce event idempotency', async () => {
    const eventId = `test_evt_${Date.now()}`;
    const payload = JSON.stringify({
      id: eventId,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_${eventId}`,
            amount: 149900,
            currency: 'INR',
          },
        },
      },
    });

    const signature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    // First delivery
    const res1 = await request(app)
      .post('/api/v1/payments/razorpay/webhook')
      .set('x-razorpay-signature', signature)
      .set('Content-Type', 'application/json')
      .send(payload);

    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.body.status, 'success');

    // Duplicate delivery
    const res2 = await request(app)
      .post('/api/v1/payments/razorpay/webhook')
      .set('x-razorpay-signature', signature)
      .set('Content-Type', 'application/json')
      .send(payload);

    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.body.status, 'already_processed');
  });
});

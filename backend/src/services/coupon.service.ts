import crypto from 'crypto';
import { Coupon, ICoupon, CouponDiscountType } from '../models/Coupon.js';
import { Course } from '../models/Course.js';
import { Order } from '../models/Order.js';
import { Enrollment } from '../models/Enrollment.js';
import { Payment } from '../models/Payment.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/orderStatus.js';
import { toObjectId } from '../utils/objectId.js';
import { enrollUser } from './enrollment.service.js';

/**
 * Generates a clean, readable uppercase alphanumeric coupon code (e.g. DSYHC, K7M9PX)
 */
export function generateRandomCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export async function createCoupon(
  data: {
    code?: string;
    courseId: string;
    discountType: CouponDiscountType;
    discountValue: number;
    maxUses?: number;
    expiresAt?: Date | null;
  },
  adminUserId?: string
): Promise<ICoupon> {
  const courseOid = toObjectId(data.courseId);
  if (!courseOid) {
    const err: any = new Error('Invalid course ID provided.');
    err.statusCode = 400;
    throw err;
  }

  const course = await Course.findById(courseOid);
  if (!course) {
    const err: any = new Error(`Course with ID '${data.courseId}' was not found.`);
    err.statusCode = 404;
    throw err;
  }

  let finalCode = (data.code || '').trim().toUpperCase();

  // If code is empty or not provided, generate a random code (e.g. DSYHC)
  if (!finalCode) {
    let attempts = 0;
    while (attempts < 10) {
      const candidate = generateRandomCode(6);
      const exists = await Coupon.exists({ code: candidate });
      if (!exists) {
        finalCode = candidate;
        break;
      }
      attempts++;
    }
    if (!finalCode) {
      finalCode = `BTS${Date.now().toString().slice(-4)}`;
    }
  } else {
    // Check if custom code is already taken
    const existing = await Coupon.findOne({ code: finalCode });
    if (existing) {
      const err: any = new Error(`Coupon code '${finalCode}' already exists.`);
      err.statusCode = 409;
      throw err;
    }
  }

  const coupon = await Coupon.create({
    code: finalCode,
    courseId: courseOid,
    discountType: data.discountType || 'fixed',
    discountValue: Number(data.discountValue) >= 0 ? Number(data.discountValue) : 0,
    maxUses: Number(data.maxUses) > 0 ? Number(data.maxUses) : 1000,
    usedCount: 0,
    isActive: true,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    createdBy: adminUserId ? toObjectId(adminUserId) : null,
  });

  return coupon;
}

export async function getCouponsByCourse(courseId: string): Promise<ICoupon[]> {
  const courseOid = toObjectId(courseId);
  if (!courseOid) return [];
  return Coupon.find({ courseId: courseOid }).sort({ createdAt: -1 });
}

export async function deleteCoupon(couponId: string): Promise<boolean> {
  const cOid = toObjectId(couponId);
  if (!cOid) return false;
  const result = await Coupon.findByIdAndDelete(cOid);
  return Boolean(result);
}

export async function toggleCouponStatus(couponId: string): Promise<ICoupon | null> {
  const cOid = toObjectId(couponId);
  if (!cOid) return null;
  const coupon = await Coupon.findById(cOid);
  if (!coupon) return null;

  coupon.isActive = !coupon.isActive;
  await coupon.save();
  return coupon;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon: {
    _id: string;
    code: string;
    courseId: string;
    discountType: CouponDiscountType;
    discountValue: number;
  };
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  isFree: boolean;
  message: string;
}

export async function validateCoupon(code: string, courseId: string): Promise<CouponValidationResult> {
  if (!code || typeof code !== 'string') {
    const err: any = new Error('Please enter a coupon code.');
    err.statusCode = 400;
    throw err;
  }

  const cleanCode = code.trim().toUpperCase();
  const courseOid = toObjectId(courseId);
  if (!courseOid) {
    const err: any = new Error('Invalid course ID.');
    err.statusCode = 400;
    throw err;
  }

  const course = await Course.findById(courseOid);
  if (!course) {
    const err: any = new Error('Course not found.');
    err.statusCode = 404;
    throw err;
  }

  const coupon = await Coupon.findOne({ code: cleanCode, courseId: courseOid });
  if (!coupon) {
    const err: any = new Error(`Coupon code '${cleanCode}' is invalid for this course.`);
    err.statusCode = 404;
    throw err;
  }

  if (!coupon.isActive) {
    const err: any = new Error(`Coupon code '${cleanCode}' is currently inactive.`);
    err.statusCode = 400;
    throw err;
  }

  if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
    const err: any = new Error(`Coupon code '${cleanCode}' has expired.`);
    err.statusCode = 400;
    throw err;
  }

  if (coupon.usedCount >= coupon.maxUses) {
    const err: any = new Error(`Coupon code '${cleanCode}' has reached its maximum redemption limit.`);
    err.statusCode = 400;
    throw err;
  }

  const originalPrice = course.price;
  let finalPrice = originalPrice;
  let discountAmount = 0;

  if (coupon.discountType === 'fixed') {
    // Fixed final price: e.g. 0 rupees means course is free
    finalPrice = Math.max(0, Math.min(originalPrice, coupon.discountValue));
    discountAmount = Math.max(0, originalPrice - finalPrice);
  } else if (coupon.discountType === 'amount') {
    // Fixed rupees discount: e.g. 500 rupees off
    discountAmount = Math.min(originalPrice, coupon.discountValue);
    finalPrice = Math.max(0, originalPrice - discountAmount);
  } else if (coupon.discountType === 'percentage') {
    // Percentage discount: e.g. 50% or 100% off
    const percent = Math.min(100, Math.max(0, coupon.discountValue));
    discountAmount = Math.round((originalPrice * percent) / 100);
    finalPrice = Math.max(0, originalPrice - discountAmount);
  }

  const isFree = finalPrice <= 0;

  return {
    valid: true,
    coupon: {
      _id: coupon._id.toString(),
      code: coupon.code,
      courseId: coupon.courseId.toString(),
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    originalPrice,
    discountAmount,
    finalPrice,
    isFree,
    message: isFree
      ? `Coupon '${coupon.code}' applied! 100% Free Enrollment granted.`
      : `Coupon '${coupon.code}' applied! You save ₹${discountAmount}.`,
  };
}

export async function redeemFreeCoupon(userId: string, courseId: string, couponCode: string) {
  const userOid = toObjectId(userId);
  const courseOid = toObjectId(courseId);

  // Prevent duplicate enrollment
  const existingEnrollment = await Enrollment.findOne({ userId: userOid, courseId: courseOid });
  if (existingEnrollment) {
    const err: any = new Error('You are already enrolled in this course.');
    err.statusCode = 409;
    throw err;
  }

  const validation = await validateCoupon(couponCode, courseId);
  if (!validation.isFree) {
    const err: any = new Error(
      `Coupon '${couponCode}' reduces price to ₹${validation.finalPrice}. Please complete payment through checkout.`
    );
    err.statusCode = 400;
    throw err;
  }

  // Directly create enrollment
  const enrollment = await enrollUser(userId, courseId);

  // Create zero-rupee order record
  const order = await Order.create({
    userId: userOid,
    courseId: courseOid,
    amount: 0,
    currency: 'INR',
    status: ORDER_STATUS.PAID,
    receipt: `rcpt_free_${couponCode.trim().toUpperCase()}_${Date.now()}`,
    notes: {
      couponCode: couponCode.trim().toUpperCase(),
      originalPrice: String(validation.originalPrice),
      discountAmount: String(validation.discountAmount),
    },
  });

  // Create zero-rupee payment audit record
  await Payment.create({
    orderId: order._id,
    userId: userOid,
    courseId: courseOid,
    razorpayPaymentId: `free_pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    razorpayOrderId: `free_ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    amount: 0,
    currency: 'INR',
    status: PAYMENT_STATUS.CAPTURED,
    method: 'COUPON_FREE',
  });

  // Increment usage
  await Coupon.updateOne({ _id: validation.coupon._id }, { $inc: { usedCount: 1 } });

  return {
    success: true,
    message: `Enrolled successfully for free using coupon '${couponCode.trim().toUpperCase()}'!`,
    enrollment,
  };
}

import { ValidatorResult } from '../middleware/validation.middleware.js';
import { isValidObjectId } from '../utils/objectId.js';

export function validateCreateOrder(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.courseId || typeof data.courseId !== 'string') {
    errors.push('Course ID is required');
  } else if (!isValidObjectId(data.courseId)) {
    errors.push(`Course ID '${data.courseId}' is not a valid 24-character hexadecimal ObjectId`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: {
      courseId: data.courseId.trim(),
    },
  };
}

export function validateVerifyPayment(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.razorpayOrderId || typeof data.razorpayOrderId !== 'string') {
    errors.push('razorpayOrderId is required');
  }
  if (!data.razorpayPaymentId || typeof data.razorpayPaymentId !== 'string') {
    errors.push('razorpayPaymentId is required');
  }
  if (!data.razorpaySignature || typeof data.razorpaySignature !== 'string') {
    errors.push('razorpaySignature is required');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: {
      razorpayOrderId: data.razorpayOrderId.trim(),
      razorpayPaymentId: data.razorpayPaymentId.trim(),
      razorpaySignature: data.razorpaySignature.trim(),
    },
  };
}

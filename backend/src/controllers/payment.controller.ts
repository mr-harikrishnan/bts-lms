import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { courseId } = req.body;
    const orderData = await paymentService.createPaymentOrder(
      req.user!._id.toString(),
      courseId
    );
    apiSuccess(res, orderData, 201, 'Payment order created.');
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await paymentService.verifyPaymentSignature(
      req.user!._id.toString(),
      req.body
    );
    apiSuccess(res, result, 200, 'Payment verified and course access granted.');
  } catch (error) {
    next(error);
  }
}

export async function razorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      apiError(res, 'Missing x-razorpay-signature header.', 400, ERROR_CODES.SIGNATURE_VERIFICATION_FAILED);
      return;
    }

    const rawBody = req.rawBody || req.body;
    const result = await paymentService.handleRazorpayWebhook(rawBody, signature);
    res.status(200).json({ received: true, ...result });
  } catch (error) {
    next(error);
  }
}

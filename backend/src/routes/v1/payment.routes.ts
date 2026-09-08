import { Router } from 'express';
import * as paymentController from '../../controllers/payment.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { paymentLimiter } from '../../middleware/rateLimit.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';
import { validateCreateOrder, validateVerifyPayment } from '../../validators/payment.validator.js';

const router = Router();

router.post(
  '/orders',
  requireAuth,
  paymentLimiter,
  validateBody(validateCreateOrder),
  paymentController.createOrder
);

router.post(
  '/verify',
  requireAuth,
  validateBody(validateVerifyPayment),
  paymentController.verifyPayment
);

// Razorpay Webhook Endpoint
router.post('/razorpay/webhook', paymentController.razorpayWebhook);

export default router;

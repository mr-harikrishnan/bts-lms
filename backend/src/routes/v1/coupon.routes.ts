import { Router } from 'express';
import * as couponController from '../../controllers/coupon.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { apiLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

router.use(apiLimiter);

// Public validation of coupon for a course during checkout
router.post('/validate', couponController.validateCoupon);

// Authenticated zero-price instant enrollment with coupon
router.post('/redeem-free', requireAuth, couponController.redeemFreeCoupon);

export default router;

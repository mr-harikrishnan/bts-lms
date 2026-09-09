import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { validateBody } from '../../middleware/validation.middleware.js';
import {
  validateLogin,
  validateSignup,
  validateForgotPassword,
  validateResetPassword,
} from '../../validators/auth.validator.js';
import { authLimiter, passwordResetLimiter } from '../../middleware/rateLimit.middleware.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/signup', authLimiter, validateBody(validateSignup), authController.signup);
router.post('/login', authLimiter, validateBody(validateLogin), authController.login);
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validateBody(validateForgotPassword),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  passwordResetLimiter,
  validateBody(validateResetPassword),
  authController.resetPassword
);
router.post('/refresh', authController.refresh);
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);

export default router;


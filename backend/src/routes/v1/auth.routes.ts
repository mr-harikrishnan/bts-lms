import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { validateBody } from '../../middleware/validation.middleware.js';
import { validateLogin, validateSignup } from '../../validators/auth.validator.js';
import { authLimiter } from '../../middleware/rateLimit.middleware.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/signup', authLimiter, validateBody(validateSignup), authController.signup);
router.post('/login', authLimiter, validateBody(validateLogin), authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);

export default router;

import { Router } from 'express';
import * as testController from '../../controllers/test.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateObjectIdParam, validateBody } from '../../middleware/validation.middleware.js';
import { validateTestSubmission } from '../../validators/test.validator.js';

const router = Router();

router.get('/:courseId', requireAuth, validateObjectIdParam('courseId'), testController.getTest);
router.post(
  '/:courseId/submit',
  requireAuth,
  validateObjectIdParam('courseId'),
  validateBody(validateTestSubmission),
  testController.submitTest
);

export default router;

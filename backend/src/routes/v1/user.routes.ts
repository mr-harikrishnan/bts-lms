import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import * as enrollmentController from '../../controllers/enrollment.controller.js';
import * as certificateController from '../../controllers/certificate.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody, validateObjectIdParam } from '../../middleware/validation.middleware.js';
import { validateUpdateProfile } from '../../validators/user.validator.js';

const router = Router();

// Profile endpoints
router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, validateBody(validateUpdateProfile), userController.updateProfile);

// User courses & progress endpoints
router.get('/courses', requireAuth, enrollmentController.getUserCourses);
router.get(
  '/courses/:courseId/progress',
  validateObjectIdParam('courseId'),
  requireAuth,
  enrollmentController.getCourseProgress
);
router.put(
  '/courses/:courseId/progress',
  validateObjectIdParam('courseId'),
  requireAuth,
  enrollmentController.updateCurrentLesson
);
router.post(
  '/courses/:courseId/lessons/:lessonId/complete',
  validateObjectIdParam('courseId', 'lessonId'),
  requireAuth,
  enrollmentController.markLessonComplete
);

// User certificates endpoints
router.get('/certificates', requireAuth, certificateController.getUserCertificates);
router.get(
  '/certificates/:certificateId',
  validateObjectIdParam('certificateId'),
  requireAuth,
  certificateController.getCertificateById
);
router.post('/certificates/generate', requireAuth, certificateController.generate);

// User lookup by ID (with IDOR protection)
router.get('/:id', validateObjectIdParam('id'), requireAuth, userController.getUserById);

export default router;

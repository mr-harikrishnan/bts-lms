import { Router } from 'express';
import * as courseController from '../../controllers/course.controller.js';
import * as enrollmentController from '../../controllers/enrollment.controller.js';
import * as testController from '../../controllers/test.controller.js';
import { validateObjectIdParam, validateQuery, validateBody } from '../../middleware/validation.middleware.js';
import { validateCourseFilters } from '../../validators/course.validator.js';
import { validateTestSubmission } from '../../validators/test.validator.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', validateQuery(validateCourseFilters), courseController.getAllCourses);
router.get(
  '/:courseId',
  optionalAuth,
  validateObjectIdParam('courseId'),
  courseController.getCourseById
);
router.get(
  '/:courseId/modules',
  optionalAuth,
  validateObjectIdParam('courseId'),
  courseController.getCourseModules
);
router.get(
  '/:courseId/lessons',
  validateObjectIdParam('courseId'),
  requireAuth,
  courseController.getCourseLessons
);
router.get(
  '/:courseId/lessons/:lessonId',
  validateObjectIdParam('courseId', 'lessonId'),
  requireAuth,
  courseController.getCourseLesson
);



// Course enrollment
router.post(
  '/:courseId/enroll',
  requireAuth,
  validateObjectIdParam('courseId'),
  enrollmentController.enroll
);

// Course assessment
router.get(
  '/:courseId/test',
  requireAuth,
  validateObjectIdParam('courseId'),
  testController.getTest
);
router.post(
  '/:courseId/test/submit',
  requireAuth,
  validateObjectIdParam('courseId'),
  validateBody(validateTestSubmission),
  testController.submitTest
);

export default router;

import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { adminLimiter } from '../../middleware/rateLimit.middleware.js';
import { validateObjectIdParam, validateBody } from '../../middleware/validation.middleware.js';
import {
  validateCourseCreate,
  validateCourseUpdate,
  validateModuleCreate,
  validateModuleUpdate,
  validateLessonCreate,
  validateLessonUpdate,
  validateTestCreate,
  validateTestUpdate,
  validateAdminUserCreate,
  validateAdminUserUpdate,
  validateEnrollmentCreate,
  validateEnrollmentUpdate,
  validateCertificateCreate,
  validateCertificateUpdate,
} from '../../validators/crud.validator.js';

const router = Router();

// Apply rate limiting, authentication, and administrative privileges across all admin routes
router.use(adminLimiter, requireAuth, requireAdmin);

// ==========================================
// Platform Overview & Statistics
// ==========================================
router.get('/stats', adminController.getAdminStats);

// ==========================================
// 1. Course Management CRUD
// ==========================================
router.post('/courses', validateBody(validateCourseCreate), adminController.createCourse);
router.get('/courses/:courseId', validateObjectIdParam('courseId'), adminController.getCourseById);
router.put(
  '/courses/:courseId',
  validateObjectIdParam('courseId'),
  validateBody(validateCourseUpdate),
  adminController.updateCourse
);
router.delete('/courses/:courseId', validateObjectIdParam('courseId'), adminController.deleteCourse);

// ==========================================
// 2. Module Management CRUD
// ==========================================
router.post('/modules', validateBody(validateModuleCreate), adminController.createModule);
router.get('/modules', adminController.getModules);
router.get('/modules/:moduleId', validateObjectIdParam('moduleId'), adminController.getModuleById);
router.put(
  '/modules/:moduleId',
  validateObjectIdParam('moduleId'),
  validateBody(validateModuleUpdate),
  adminController.updateModule
);
router.delete('/modules/:moduleId', validateObjectIdParam('moduleId'), adminController.deleteModule);

// ==========================================
// 3. Lesson Management CRUD
// ==========================================
router.post('/lessons', validateBody(validateLessonCreate), adminController.createLesson);
router.get('/lessons', adminController.getLessons);
router.get('/lessons/:lessonId', validateObjectIdParam('lessonId'), adminController.getLessonById);
router.put(
  '/lessons/:lessonId',
  validateObjectIdParam('lessonId'),
  validateBody(validateLessonUpdate),
  adminController.updateLesson
);
router.delete('/lessons/:lessonId', validateObjectIdParam('lessonId'), adminController.deleteLesson);

// ==========================================
// 4. Test / Quiz Management CRUD
// ==========================================
router.post('/tests', validateBody(validateTestCreate), adminController.createTest);
router.get('/tests', adminController.getAllTests);
router.get('/tests/:testId', validateObjectIdParam('testId'), adminController.getTestById);
router.put(
  '/tests/:testId',
  validateObjectIdParam('testId'),
  validateBody(validateTestUpdate),
  adminController.updateTest
);
router.delete('/tests/:testId', validateObjectIdParam('testId'), adminController.deleteTest);

// ==========================================
// 5. User Management CRUD
// ==========================================
router.post('/users', validateBody(validateAdminUserCreate), adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', validateObjectIdParam('userId'), adminController.getUserById);
router.put(
  '/users/:userId',
  validateObjectIdParam('userId'),
  validateBody(validateAdminUserUpdate),
  adminController.updateUser
);
router.patch('/users/:userId/role', validateObjectIdParam('userId'), adminController.updateUserRole);
router.delete('/users/:userId', validateObjectIdParam('userId'), adminController.deleteUser);

// ==========================================
// 6. Enrollment Management CRUD
// ==========================================
router.post('/enrollments', validateBody(validateEnrollmentCreate), adminController.grantManualEnrollment);
router.get('/enrollments', adminController.getAllEnrollments);
router.get('/enrollments/:enrollmentId', validateObjectIdParam('enrollmentId'), adminController.getEnrollmentById);
router.put(
  '/enrollments/:enrollmentId',
  validateObjectIdParam('enrollmentId'),
  validateBody(validateEnrollmentUpdate),
  adminController.updateEnrollment
);
router.delete(
  '/enrollments/:enrollmentId',
  validateObjectIdParam('enrollmentId'),
  adminController.revokeEnrollment
);

// ==========================================
// 7. Certificate Management CRUD
// ==========================================
router.post('/certificates', validateBody(validateCertificateCreate), adminController.createCertificate);
router.get('/certificates', adminController.getAllCertificates);
router.get('/certificates/:certificateId', validateObjectIdParam('certificateId'), adminController.getCertificateById);
router.put(
  '/certificates/:certificateId',
  validateObjectIdParam('certificateId'),
  validateBody(validateCertificateUpdate),
  adminController.updateCertificate
);
router.delete(
  '/certificates/:certificateId',
  validateObjectIdParam('certificateId'),
  adminController.deleteCertificate
);

// ==========================================
// 8. Payment & Refund Management
// ==========================================
router.get('/payments', adminController.getAllPayments);
router.post(
  '/payments/:paymentId/refund',
  validateObjectIdParam('paymentId'),
  adminController.processRefund
);

export default router;

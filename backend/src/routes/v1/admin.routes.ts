import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { adminLimiter } from '../../middleware/rateLimit.middleware.js';
import { validateObjectIdParam } from '../../middleware/validation.middleware.js';

const router = Router();

// Apply rate limiting, authentication and administrative privileges across all admin routes
router.use(adminLimiter, requireAuth, requireAdmin);

// Platform Overview & Statistics
router.get('/stats', adminController.getAdminStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/role', validateObjectIdParam('userId'), adminController.updateUserRole);
router.delete('/users/:userId', validateObjectIdParam('userId'), adminController.deleteUser);

// Course Management
router.post('/courses', adminController.createCourse);
router.put('/courses/:courseId', validateObjectIdParam('courseId'), adminController.updateCourse);
router.delete('/courses/:courseId', validateObjectIdParam('courseId'), adminController.deleteCourse);

// Enrollment Management
router.get('/enrollments', adminController.getAllEnrollments);
router.post('/enrollments', adminController.grantManualEnrollment);
router.delete(
  '/enrollments/:enrollmentId',
  validateObjectIdParam('enrollmentId'),
  adminController.revokeEnrollment
);

// Payment & Refund Management
router.get('/payments', adminController.getAllPayments);
router.post(
  '/payments/:paymentId/refund',
  validateObjectIdParam('paymentId'),
  adminController.processRefund
);

export default router;

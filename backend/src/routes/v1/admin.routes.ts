import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { validateObjectIdParam } from '../../middleware/validation.middleware.js';

const router = Router();

// Enforce authentication and administrative privileges across all admin routes
router.use(requireAuth, requireAdmin);

// Course Management
router.post('/courses', adminController.createCourse);
router.put('/courses/:courseId', validateObjectIdParam('courseId'), adminController.updateCourse);
router.delete('/courses/:courseId', validateObjectIdParam('courseId'), adminController.deleteCourse);

// Enrollment Management
router.get('/enrollments', adminController.getAllEnrollments);
router.delete(
  '/enrollments/:enrollmentId',
  validateObjectIdParam('enrollmentId'),
  adminController.revokeEnrollment
);

// Payment Management
router.get('/payments', adminController.getAllPayments);
router.post(
  '/payments/:paymentId/refund',
  validateObjectIdParam('paymentId'),
  adminController.processRefund
);

export default router;

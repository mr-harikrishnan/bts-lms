import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import courseRoutes from './course.routes.js';
import moduleRoutes from './module.routes.js';
import lessonRoutes from './lesson.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import certificateRoutes from './certificate.routes.js';
import testRoutes from './test.routes.js';
import paymentRoutes from './payment.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/user', userRoutes); // Alias for user profile & enrolled operations
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/certificates', certificateRoutes);
router.use('/tests', testRoutes);
router.use('/payments', paymentRoutes);

export default router;

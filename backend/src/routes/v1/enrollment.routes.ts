import { Router } from 'express';
import * as enrollmentController from '../../controllers/enrollment.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, enrollmentController.getUserCourses);

export default router;

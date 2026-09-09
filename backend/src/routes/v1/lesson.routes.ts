import { Router } from 'express';
import * as courseController from '../../controllers/course.controller.js';
import { validateObjectIdParam } from '../../middleware/validation.middleware.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/:id', validateObjectIdParam('id'), requireAuth, courseController.getLessonById);

export default router;



import { Router } from 'express';
import * as courseController from '../../controllers/course.controller.js';
import { validateObjectIdParam } from '../../middleware/validation.middleware.js';

const router = Router();

router.get('/:id', validateObjectIdParam('id'), courseController.getLessonById);

export default router;

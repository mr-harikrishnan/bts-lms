import { Router } from 'express';
import * as courseController from '../../controllers/course.controller.js';
import { validateObjectIdParam } from '../../middleware/validation.middleware.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/:id', optionalAuth, validateObjectIdParam('id'), courseController.getModuleById);

export default router;


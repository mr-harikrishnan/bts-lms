import { Router } from 'express';
import * as categoryController from '../../controllers/category.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { validateObjectIdParam, validateBody } from '../../middleware/validation.middleware.js';
import { validateCategoryCreate, validateCategoryUpdate } from '../../validators/crud.validator.js';

const router = Router();

// Public: list all active categories
router.get('/', categoryController.getAllCategories);
router.get('/:categoryId', validateObjectIdParam('categoryId'), categoryController.getCategoryById);

// Admin-only management routes
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validateBody(validateCategoryCreate),
  categoryController.createCategory
);

router.put(
  '/:categoryId',
  requireAuth,
  requireAdmin,
  validateObjectIdParam('categoryId'),
  validateBody(validateCategoryUpdate),
  categoryController.updateCategory
);

router.delete(
  '/:categoryId',
  requireAuth,
  requireAdmin,
  validateObjectIdParam('categoryId'),
  categoryController.deleteCategory
);

export default router;

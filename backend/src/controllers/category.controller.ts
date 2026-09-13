import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { toObjectId } from '../utils/objectId.js';

const DEFAULT_CATEGORIES = [
  { name: 'Web Development', slug: 'web-development', description: 'Modern frontend, backend, and full-stack engineering', order: 1 },
  { name: 'Digital Marketing', slug: 'digital-marketing', description: 'Performance marketing, SEO, paid ads, and analytics', order: 2 },
  { name: 'Content Creation', slug: 'content-creation', description: 'Short-form video, storytelling, branding, and editing', order: 3 },
];

/**
 * Auto-seeds default categories if the collection is completely empty
 */
async function ensureDefaultCategories() {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
  }
}

export async function getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await ensureDefaultCategories();
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    apiSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function getAdminCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await ensureDefaultCategories();
    const categories = await Category.find().sort({ order: 1, createdAt: -1 });
    apiSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categoryId = req.params.categoryId as string;
    const category = await Category.findById(toObjectId(categoryId));
    if (!category) {
      apiError(res, 'Category not found.', 404);
      return;
    }
    apiSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, slug, description, icon, order } = req.body;
    const trimmedName = name.trim();
    const generatedSlug = (slug || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase().trim();

    const existing = await Category.findOne({
      $or: [{ name: { $regex: `^${trimmedName}$`, $options: 'i' } }, { slug: generatedSlug }],
    });

    if (existing) {
      apiError(res, 'A category with this name or slug already exists.', 409);
      return;
    }

    const category = await Category.create({
      name: trimmedName,
      slug: generatedSlug,
      description: description ? description.trim() : '',
      icon: icon ? icon.trim() : '',
      order: typeof order === 'number' ? order : 0,
      isActive: true,
    });

    apiSuccess(res, category, 201, 'Category created successfully.');
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categoryId = req.params.categoryId as string;
    const categoryOid = toObjectId(categoryId);
    const updateData: Record<string, any> = { ...req.body };

    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }
    if (updateData.slug) {
      updateData.slug = updateData.slug.toLowerCase().trim();
    }

    // Check conflict if name or slug changed
    if (updateData.name || updateData.slug) {
      const conflict = await Category.findOne({
        _id: { $ne: categoryOid },
        $or: [
          ...(updateData.name ? [{ name: { $regex: `^${updateData.name}$`, $options: 'i' } }] : []),
          ...(updateData.slug ? [{ slug: updateData.slug }] : []),
        ],
      });
      if (conflict) {
        apiError(res, 'Another category already exists with this name or slug.', 409);
        return;
      }
    }

    const category = await Category.findByIdAndUpdate(categoryOid, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      apiError(res, 'Category not found.', 404);
      return;
    }

    apiSuccess(res, category, 200, 'Category updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categoryId = req.params.categoryId as string;
    const category = await Category.findByIdAndDelete(toObjectId(categoryId));
    if (!category) {
      apiError(res, 'Category not found.', 404);
      return;
    }
    apiSuccess(res, { message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

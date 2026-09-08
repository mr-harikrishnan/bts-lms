import { ValidatorResult } from '../middleware/validation.middleware.js';

export function validateCourseFilters(query: any): ValidatorResult {
  const sanitized: Record<string, any> = {};

  if (query.category && typeof query.category === 'string') {
    sanitized.category = query.category.trim();
  }
  if (query.level && typeof query.level === 'string') {
    sanitized.level = query.level.trim();
  }
  if (query.search && typeof query.search === 'string') {
    sanitized.search = query.search.trim();
  }
  if (query.sort && typeof query.sort === 'string') {
    sanitized.sort = query.sort.trim();
  }
  if (query.featured !== undefined) {
    sanitized.featured = query.featured === 'true' || query.featured === true;
  }
  if (query.limit !== undefined) {
    const limit = parseInt(String(query.limit), 10);
    sanitized.limit = Number.isNaN(limit) ? 20 : Math.min(Math.max(1, limit), 100);
  }
  if (query.page !== undefined) {
    const page = parseInt(String(query.page), 10);
    sanitized.page = Number.isNaN(page) ? 1 : Math.max(1, page);
  }

  return {
    valid: true,
    sanitized,
  };
}

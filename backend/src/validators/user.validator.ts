import { ValidatorResult } from '../middleware/validation.middleware.js';

export function validateUpdateProfile(data: any): ValidatorResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  // Strictly whitelisted fields:
  const allowedKeys = ['name', 'college', 'district', 'state', 'rollNumber', 'grantName', 'avatar'];
  const sanitized: Record<string, string> = {};

  for (const key of allowedKeys) {
    if (data[key] !== undefined && typeof data[key] === 'string') {
      sanitized[key] = data[key].trim();
    }
  }

  if (Object.keys(sanitized).length === 0) {
    return { valid: false, errors: ['At least one valid field to update must be provided'] };
  }

  return {
    valid: true,
    sanitized,
  };
}

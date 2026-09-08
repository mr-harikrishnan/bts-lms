import { Request, Response, NextFunction } from 'express';
import { ROLES } from '../constants/roles.js';
import { apiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    apiError(res, 'Authentication required.', 401, ERROR_CODES.UNAUTHENTICATED);
    return;
  }

  if (req.user.role !== ROLES.ADMIN) {
    apiError(res, 'Forbidden: Administrative privileges required.', 403, ERROR_CODES.FORBIDDEN);
    return;
  }

  next();
}

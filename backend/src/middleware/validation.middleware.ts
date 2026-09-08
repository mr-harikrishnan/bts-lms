import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from '../utils/objectId.js';
import { apiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export function validateObjectIdParam(...paramNames: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      if (!isValidObjectId(id)) {
        apiError(
          res,
          `Invalid MongoDB ObjectId format for parameter '${paramName}': '${id}'. Expected 24-character hex string.`,
          400,
          ERROR_CODES.INVALID_OBJECT_ID
        );
        return;
      }
    }
    next();
  };
}

export type ValidatorResult<T = any> = {
  valid: boolean;
  errors?: string[];
  sanitized?: T;
};

export function validateBody<T>(validator: (data: any) => ValidatorResult<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validator(req.body);
    if (!result.valid) {
      apiError(
        res,
        'Validation failed for request body.',
        400,
        ERROR_CODES.VALIDATION_ERROR,
        result.errors
      );
      return;
    }
    if (result.sanitized !== undefined) {
      req.body = result.sanitized;
    }
    next();
  };
}

export function validateQuery<T>(validator: (data: any) => ValidatorResult<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validator(req.query);
    if (!result.valid) {
      apiError(
        res,
        'Validation failed for query parameters.',
        400,
        ERROR_CODES.VALIDATION_ERROR,
        result.errors
      );
      return;
    }
    if (result.sanitized !== undefined) {
      (req as any).query = result.sanitized;
    }
    next();
  };
}

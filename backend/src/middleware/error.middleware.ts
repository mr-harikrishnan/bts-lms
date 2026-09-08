import { Request, Response, NextFunction } from 'express';
import { apiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error(`API Error on [${req.method}] ${req.originalUrl}:`, err);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    apiError(
      res,
      `Invalid identifier format for '${err.path}': '${err.value}'`,
      400,
      ERROR_CODES.INVALID_OBJECT_ID
    );
    return;
  }

  // Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    apiError(
      res,
      `A record with this ${fields || 'value'} already exists.`,
      409,
      ERROR_CODES.ALREADY_EXISTS
    );
    return;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    apiError(
      res,
      'Validation error occurred.',
      400,
      ERROR_CODES.VALIDATION_ERROR,
      messages
    );
    return;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    apiError(
      res,
      'Authentication session is invalid or expired. Please sign in again.',
      401,
      ERROR_CODES.UNAUTHENTICATED
    );
    return;
  }

  // CORS Error
  if (err.message && err.message.includes('CORS policy')) {
    apiError(res, 'Cross-origin request blocked.', 403, ERROR_CODES.FORBIDDEN);
    return;
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = statusCode === 500 ? 'An internal server error occurred.' : err.message || 'Error occurred.';

  apiError(res, message, statusCode, ERROR_CODES.INTERNAL_SERVER_ERROR);
}

export function notFoundHandler(req: Request, res: Response): void {
  apiError(
    res,
    `Cannot find resource at [${req.method}] ${req.originalUrl}`,
    404,
    ERROR_CODES.NOT_FOUND
  );
}

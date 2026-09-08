import { Response } from 'express';
import { ERROR_CODES, ErrorCode } from '../constants/errorCodes.js';

export function apiSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
): Response {
  const response: { success: true; data: T; message?: string } = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  return res.status(statusCode).json(response);
}

export function apiError(
  res: Response,
  message: string,
  statusCode: number = 400,
  code: ErrorCode = ERROR_CODES.VALIDATION_ERROR,
  errors: unknown = null
): Response {
  const response: { success: false; message: string; code: string; errors?: unknown } = {
    success: false,
    message,
    code,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
}

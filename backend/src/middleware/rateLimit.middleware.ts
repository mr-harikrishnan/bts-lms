import rateLimit from 'express-rate-limit';
import { apiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    apiError(
      res,
      'Too many authentication attempts. Please try again after 15 minutes.',
      429,
      ERROR_CODES.RATE_LIMIT_EXCEEDED
    );
  },
});

export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    apiError(
      res,
      'Too many payment requests created. Please try again later.',
      429,
      ERROR_CODES.RATE_LIMIT_EXCEEDED
    );
  },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    apiError(
      res,
      'Too many password reset attempts. Please try again after 15 minutes.',
      429,
      ERROR_CODES.RATE_LIMIT_EXCEEDED
    );
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    apiError(
      res,
      'API rate limit exceeded. Please slow down your requests.',
      429,
      ERROR_CODES.RATE_LIMIT_EXCEEDED
    );
  },
});


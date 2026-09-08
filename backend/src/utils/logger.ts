import { env } from '../config/env.js';

const SENSITIVE_KEYS = new Set([
  'password',
  'newpassword',
  'token',
  'refreshtoken',
  'authorization',
  'cookie',
  'razorpay_signature',
  'secret',
  'key_secret',
]);

function maskSensitive(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(maskSensitive);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = maskSensitive(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info(message: string, meta: any = null): void {
    if (meta) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, maskSensitive(meta));
    } else {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }
  },

  warn(message: string, meta: any = null): void {
    if (meta) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, maskSensitive(meta));
    } else {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    }
  },

  error(message: string, error: any = null): void {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: env.isProduction ? undefined : error.stack }
      : maskSensitive(error);
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, errorDetails || '');
  },
};

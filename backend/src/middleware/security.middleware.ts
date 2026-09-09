import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env.js';

export const helmetSecurity = helmet({
  contentSecurityPolicy: env.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
});

export const corsSecurity = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const configuredFrontend = env.FRONTEND_URL.replace(/\/$/, '');
    const cleanOrigin = origin.replace(/\/$/, '');

    // In production, strictly enforce the configured FRONTEND_URL and reject all localhost/127.0.0.1 origins
    if (env.isProduction) {
      const isLocalhost =
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1');

      if (isLocalhost) {
        return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
      }

      if (cleanOrigin === configuredFrontend) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    }


    // In development/test, allow configured FRONTEND_URL and local dev ports
    const devAllowedOrigins = [
      configuredFrontend,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    if (devAllowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
});

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Prevent NoSQL injection ($where, $gt, etc.)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeObject(value);
  }
  return clean;
}

export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}

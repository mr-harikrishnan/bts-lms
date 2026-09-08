import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { helmetSecurity, corsSecurity, sanitizeInput } from './middleware/security.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';
import { env } from './config/env.js';

export function createApp(): Application {
  const app: Application = express();

  // Trust proxy if behind reverse proxy
  app.set('trust proxy', 1);

  // Security Headers & CORS
  app.use(helmetSecurity);
  app.use(corsSecurity);

  // Body parsers with size limit & raw body capture for webhooks
  app.use(
    express.json({
      limit: '15kb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '15kb' }));
  app.use(cookieParser());

  // Structured request logging
  if (!env.isProduction) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Sanitize against NoSQL injection
  app.use(sanitizeInput);

  // General rate limiter for API routes
  app.use('/api', apiLimiter);

  // Mount API routes
  app.use('/api', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Centralized Error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();

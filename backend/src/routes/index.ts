import { Router } from 'express';
import v1Routes from './v1/index.js';

const router = Router();

// API Healthcheck
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'bts-lms-backend',
    version: '1.0.0',
  });
});

// Versioned routes
router.use('/v1', v1Routes);

export default router;

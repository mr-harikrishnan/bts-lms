import { Router } from 'express';
import * as notifController from '../../controllers/notification.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', notifController.getMyNotifications);
router.patch('/:id/read', notifController.markAsRead);
router.post('/read-all', notifController.markAllAsRead);
router.delete('/:id', notifController.deleteNotification);

export default router;

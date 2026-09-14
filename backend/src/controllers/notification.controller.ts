import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notifications = await notificationService.getUserNotifications(req.user!._id.toString());
    apiSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markNotificationAsRead(
      req.params.id as string,
      req.user!._id.toString()
    );
    apiSuccess(res, { success: true }, 200, 'Notification marked as read.');
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllNotificationsAsRead(req.user!._id.toString());
    apiSuccess(res, { success: true }, 200, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await notificationService.deleteNotification(
      req.params.id as string,
      req.user!._id.toString()
    );
    apiSuccess(res, result, 200, 'Notification removed.');
  } catch (error) {
    next(error);
  }
}


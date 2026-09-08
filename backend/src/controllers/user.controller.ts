import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await userService.getUserProfile(req.user!._id.toString());
    apiSuccess(res, profile);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await userService.updateUserProfile(req.user!._id.toString(), req.body);
    apiSuccess(res, updated, 200, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetId = req.params.id as string;
    const requestingUserId = req.user!._id.toString();
    const requestingUserRole = req.user!.role;

    const user = await userService.getUserById(targetId, requestingUserId, requestingUserRole);
    apiSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

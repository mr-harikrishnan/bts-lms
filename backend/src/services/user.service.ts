import { User } from '../models/User.js';
import { toObjectId } from '../utils/objectId.js';
import { ROLES } from '../constants/roles.js';

export async function getUserProfile(userId: string) {
  const user = await User.findById(toObjectId(userId));
  if (!user) {
    const error: any = new Error('User profile not found.');
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
}

export async function updateUserProfile(userId: string, updates: Record<string, any>) {
  const user = await User.findById(toObjectId(userId));
  if (!user) {
    const error: any = new Error('User profile not found.');
    error.statusCode = 404;
    throw error;
  }

  // Strictly apply only whitelisted profile fields
  const allowedKeys = ['name', 'college', 'district', 'state', 'rollNumber', 'grantName', 'avatar'];
  for (const key of allowedKeys) {
    if (updates[key] !== undefined) {
      (user as any)[key] = updates[key];
    }
  }

  await user.save();
  return user.toJSON();
}

export async function getUserById(
  targetId: string,
  requestingUserId: string,
  requestingUserRole: string
) {
  // IDOR & Broken Access Control Guard:
  // Non-admins can only access their own user document
  if (targetId !== requestingUserId && requestingUserRole !== ROLES.ADMIN) {
    const error: any = new Error('Forbidden: You do not have permission to view this profile.');
    error.statusCode = 403;
    throw error;
  }

  const user = await User.findById(toObjectId(targetId));
  if (!user) {
    const error: any = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user.toJSON();
}

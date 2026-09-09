import crypto from 'crypto';
import { User, IUser } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { ROLES } from '../constants/roles.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { sendPasswordResetEmail } from './email.service.js';

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  college?: string;
  district?: string;
  state?: string;
  rollNumber?: string;
  grantName?: string;
  avatar?: string;
}) {
  const existingUser = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (existingUser) {
    const error: any = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: hashedPassword,
    role: ROLES.STUDENT,
    college: data.college || '',
    district: data.district || '',
    state: data.state || '',
    rollNumber: data.rollNumber || '',
    grantName: data.grantName || '',
    avatar: data.avatar || '',
  });

  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
}

export async function loginUser(email: string, plainTextPassword: string) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !user.password) {
    const error: any = new Error('Invalid email or password credentials.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await comparePassword(plainTextPassword, user.password);
  if (!isMatch) {
    const error: any = new Error('Invalid email or password credentials.');
    error.statusCode = 401;
    throw error;
  }

  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) {
    const error: any = new Error('Refresh token is required.');
    error.statusCode = 401;
    throw error;
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload || !payload.userId) {
    const error: any = new Error('Invalid or expired refresh token.');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(payload.userId).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    const error: any = new Error('Refresh token has been revoked or is invalid.');
    error.statusCode = 401;
    throw error;
  }

  const newPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const newAccessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logoutUser(userId: string) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  return true;
}

export async function forgotPassword(email: string) {
  if (!email) {
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  // Prevent user enumeration: always return same message
  if (!user) {
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  // Generate cryptographically secure reset token
  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = crypto
    .createHash('sha256')
    .update(rawResetToken)
    .digest('hex');

  // Token valid for 15 minutes
  user.passwordResetToken = hashedResetToken;
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawResetToken}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  } catch (err) {
    logger.error('Failed to send password reset email:', err);
  }

  return {
    message: 'If an account with that email exists, a password reset link has been sent.',
  };
}

export async function resetPassword(token: string, newPlainTextPassword: string) {
  if (!token) {
    const error: any = new Error('Password reset token is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!newPlainTextPassword || newPlainTextPassword.length < 8) {
    const error: any = new Error('Password must be at least 8 characters long.');
    error.statusCode = 400;
    throw error;
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires +refreshToken');

  if (!user) {
    const error: any = new Error('Password reset token is invalid or has expired.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(newPlainTextPassword);
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // Invalidate existing sessions and refresh token
  user.refreshToken = undefined;
  await user.save();

  return {
    message: 'Password has been successfully reset. You can now sign in with your new password.',
  };
}


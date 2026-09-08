import { User, IUser } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { ROLES } from '../constants/roles.js';

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

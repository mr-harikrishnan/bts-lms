import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { apiSuccess } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.registerUser(req.body);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    apiSuccess(res, result, 201, 'Account created successfully.');
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    apiSuccess(res, result, 200, 'Signed in successfully.');
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    apiSuccess(res, { user: req.user?.toJSON() || null });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const tokens = await authService.refreshAccessToken(token);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    apiSuccess(res, tokens, 200);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user) {
      await authService.logoutUser(req.user._id.toString());
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    apiSuccess(res, { message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    apiSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    apiSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}


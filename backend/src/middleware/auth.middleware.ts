import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.js';
import { User, IUser } from '../models/User.js';
import { apiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      rawBody?: Buffer;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && (req.cookies.accessToken || req.cookies.token)) {
      token = req.cookies.accessToken || req.cookies.token;
    }

    if (!token) {
      apiError(res, 'Authentication required. Please sign in.', 401, ERROR_CODES.UNAUTHENTICATED);
      return;
    }

    const payload = verifyAccessToken(token);
    if (!payload || !payload.userId) {
      apiError(res, 'Invalid or expired access token.', 401, ERROR_CODES.UNAUTHENTICATED);
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      apiError(res, 'User account not found.', 401, ERROR_CODES.UNAUTHENTICATED);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    apiError(res, 'Authentication failed.', 401, ERROR_CODES.UNAUTHENTICATED);
  }
}

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && (req.cookies.accessToken || req.cookies.token)) {
      token = req.cookies.accessToken || req.cookies.token;
    }

    if (token) {
      const payload = verifyAccessToken(token);
      if (payload && payload.userId) {
        const user = await User.findById(payload.userId);
        if (user) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
}

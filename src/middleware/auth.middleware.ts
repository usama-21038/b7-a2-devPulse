import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/response';

// JWT payload এর ধরন define করা হচ্ছে
export interface JwtPayload {
  id: number;
  name: string;
  role: string;
}

// Express এর Request type-এ user যোগ করা হচ্ছে
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Token যাচাই করার middleware
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers['authorization'];

  if (!token) {
    sendError(res, StatusCodes.UNAUTHORIZED, 'Authorization token missing');
    return;
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded; // decoded payload টি request এ attach করা হলো
    next();
  } catch {
    sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
  }
};

// শুধুমাত্র maintainer রোলের জন্য permission check
export const requireMaintainer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'maintainer') {
    sendError(res, StatusCodes.FORBIDDEN, 'Access denied. Maintainer role required');
    return;
  }
  next();
};
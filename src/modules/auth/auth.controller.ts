import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { registerUser, loginUser } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

// POST /api/auth/signup
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Name, email and password are required');
      return;
    }

    const user = await registerUser({ name, email, password, role });
    sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', user);
  } catch (error) {
    const err = error as Error;

    if (err.message === 'EMAIL_EXISTS') {
      sendError(res, StatusCodes.BAD_REQUEST, 'Email already registered');
      return;
    }
    if (err.message === 'INVALID_ROLE') {
      sendError(res, StatusCodes.BAD_REQUEST, 'Role must be contributor or maintainer');
      return;
    }

    next(error); // unhandled error global handler-এ পাঠানো হচ্ছে
  }
};

// POST /api/auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Email and password are required');
      return;
    }

    const data = await loginUser({ email, password });
    sendSuccess(res, StatusCodes.OK, 'Login successful', data);
  } catch (error) {
    const err = error as Error;

    if (err.message === 'INVALID_CREDENTIALS') {
      sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid email or password');
      return;
    }

    next(error);
  }
};
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

// Centralized error handling middleware - সব async/sync error এখানে আসে
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
  console.error('Error:', err.message);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    errors: err.message,
  });
};
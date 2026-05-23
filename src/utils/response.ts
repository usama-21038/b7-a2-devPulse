import { Response } from 'express';

// Success response পাঠানোর utility function
export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Error response পাঠানোর utility function
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
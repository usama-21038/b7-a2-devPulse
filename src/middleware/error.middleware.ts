import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';


export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction 
): void => {
  console.error('Error:', err.message);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    errors: err.message,
  });
};
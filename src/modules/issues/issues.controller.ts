import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from './issues.service';
import { sendSuccess, sendError } from '../../utils/response';

// POST /api/issues
export const createIssueController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, type } = req.body;

    if (!title || !description || !type) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Title, description and type are required');
      return;
    }

    // reporter_id টি JWT থেকে নেওয়া হচ্ছে, request body থেকে নয়
    const reporterId = req.user!.id;
    const issue = await createIssue({ title, description, type, reporterId });
    sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', issue);
  } catch (error) {
    const err = error as Error;
    const errorMap: Record<string, [number, string]> = {
      INVALID_TYPE:        [StatusCodes.BAD_REQUEST, 'Type must be bug or feature_request'],
      TITLE_TOO_LONG:      [StatusCodes.BAD_REQUEST, 'Title must be 150 characters or less'],
      DESCRIPTION_TOO_SHORT:[StatusCodes.BAD_REQUEST, 'Description must be at least 20 characters'],
      REPORTER_NOT_FOUND:  [StatusCodes.NOT_FOUND, 'Reporter not found'],
    };
    const mapped = errorMap[err.message];
    if (mapped) { sendError(res, mapped[0], mapped[1]); return; }
    next(error);
  }
};

// GET /api/issues
export const getAllIssuesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sort, type, status } = req.query as Record<string, string>;
    const issues = await getAllIssues(sort, type, status);
    sendSuccess(res, StatusCodes.OK, 'Issues retrived successfully', issues);
  } catch (error) {
    next(error);
  }
};

// GET /api/issues/:id
export const getIssueByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID');
      return;
    }
    const issue = await getIssueById(id);
    sendSuccess(res, StatusCodes.OK, 'Issue retrived successfully', issue);
  } catch (error) {
    const err = error as Error;
    if (err.message === 'ISSUE_NOT_FOUND') { sendError(res, StatusCodes.NOT_FOUND, 'Issue not found'); return; }
    next(error);
  }
};

// PATCH /api/issues/:id
export const updateIssueController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID');
      return;
    }
    const issue = await updateIssue(id, req.user!.id, req.user!.role, req.body);
    sendSuccess(res, StatusCodes.OK, 'Issue updated successfully', issue);
  } catch (error) {
    const err = error as Error;
    const errorMap: Record<string, [number, string]> = {
      ISSUE_NOT_FOUND:      [StatusCodes.NOT_FOUND, 'Issue not found'],
      FORBIDDEN:            [StatusCodes.FORBIDDEN, 'You can only update your own issues'],
      ISSUE_NOT_OPEN:       [StatusCodes.CONFLICT, 'You can only update issues with open status'],
      INVALID_TYPE:         [StatusCodes.BAD_REQUEST, 'Type must be bug or feature_request'],
      TITLE_TOO_LONG:       [StatusCodes.BAD_REQUEST, 'Title must be 150 characters or less'],
      DESCRIPTION_TOO_SHORT:[StatusCodes.BAD_REQUEST, 'Description must be at least 20 characters'],
    };
    const mapped = errorMap[err.message];
    if (mapped) { sendError(res, mapped[0], mapped[1]); return; }
    next(error);
  }
};

// DELETE /api/issues/:id
export const deleteIssueController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID');
      return;
    }
    await deleteIssue(id);
    sendSuccess(res, StatusCodes.OK, 'Issue deleted successfully');
  } catch (error) {
    const err = error as Error;
    if (err.message === 'ISSUE_NOT_FOUND') { sendError(res, StatusCodes.NOT_FOUND, 'Issue not found'); return; }
    next(error);
  }
};
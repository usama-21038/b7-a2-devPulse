import { Router } from 'express';
import {
  createIssueController,
  getAllIssuesController,
  getIssueByIdController,
  updateIssueController,
  deleteIssueController,
} from './issues.controller';
import { authenticate, requireMaintainer } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllIssuesController);
router.get('/:id', getIssueByIdController);

// Authenticated routes
router.post('/', authenticate, createIssueController);
router.patch('/:id', authenticate, updateIssueController);

// Maintainer only
router.delete('/:id', authenticate, requireMaintainer, deleteIssueController);

export default router;
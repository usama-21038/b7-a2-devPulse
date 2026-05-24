"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIssueController = exports.updateIssueController = exports.getIssueByIdController = exports.getAllIssuesController = exports.createIssueController = void 0;
const http_status_codes_1 = require("http-status-codes");
const issues_service_1 = require("./issues.service");
const response_1 = require("../../utils/response");
// POST /api/issues
const createIssueController = async (req, res, next) => {
    try {
        const { title, description, type } = req.body;
        if (!title || !description || !type) {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, 'Title, description and type are required');
            return;
        }
        const reporterId = req.user.id;
        const issue = await (0, issues_service_1.createIssue)({ title, description, type, reporterId });
        (0, response_1.sendSuccess)(res, http_status_codes_1.StatusCodes.CREATED, 'Issue created successfully', issue);
    }
    catch (error) {
        const err = error;
        const errorMap = {
            INVALID_TYPE: [http_status_codes_1.StatusCodes.BAD_REQUEST, 'Type must be bug or feature_request'],
            TITLE_TOO_LONG: [http_status_codes_1.StatusCodes.BAD_REQUEST, 'Title must be 150 characters or less'],
            DESCRIPTION_TOO_SHORT: [http_status_codes_1.StatusCodes.BAD_REQUEST, 'Description must be at least 20 characters'],
            REPORTER_NOT_FOUND: [http_status_codes_1.StatusCodes.NOT_FOUND, 'Reporter not found'],
        };
        const mapped = errorMap[err.message];
        if (mapped) {
            (0, response_1.sendError)(res, mapped[0], mapped[1]);
            return;
        }
        next(error);
    }
};
exports.createIssueController = createIssueController;
// GET /api/issues
const getAllIssuesController = async (req, res, next) => {
    try {
        const { sort, type, status } = req.query;
        const issues = await (0, issues_service_1.getAllIssues)(sort, type, status);
        (0, response_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, 'Issues retrived successfully', issues);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllIssuesController = getAllIssuesController;
// GET /api/issues/:id
const getIssueByIdController = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid issue ID');
            return;
        }
        const issue = await (0, issues_service_1.getIssueById)(id);
        (0, response_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, 'Issue retrived successfully', issue);
    }
    catch (error) {
        const err = error;
        if (err.message === 'ISSUE_NOT_FOUND') {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Issue not found');
            return;
        }
        next(error);
    }
};
exports.getIssueByIdController = getIssueByIdController;
// PATCH /api/issues/:id
const updateIssueController = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid issue ID');
            return;
        }
        const issue = await (0, issues_service_1.updateIssue)(id, req.user.id, req.user.role, req.body);
        (0, response_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, 'Issue updated successfully', issue);
    }
    catch (error) {
        const err = error;
        const errorMap = {
            ISSUE_NOT_FOUND: [http_status_codes_1.StatusCodes.NOT_FOUND, 'Issue not found'],
            FORBIDDEN: [http_status_codes_1.StatusCodes.FORBIDDEN, 'You can only update your own issues'],
            ISSUE_NOT_OPEN: [http_status_codes_1.StatusCodes.CONFLICT, 'You can only update issues with open status'],
            INVALID_TYPE: [http_status_codes_1.StatusCodes.BAD_REQUEST, 'Type must be bug or feature_request'],
            TITLE_TOO_LONG: [http_status_codes_1.StatusCodes.BAD_REQUEST, 'Title must be 150 characters or less'],
            DESCRIPTION_TOO_SHORT: [http_status_codes_1.StatusCodes.BAD_REQUEST, 'Description must be at least 20 characters'],
        };
        const mapped = errorMap[err.message];
        if (mapped) {
            (0, response_1.sendError)(res, mapped[0], mapped[1]);
            return;
        }
        next(error);
    }
};
exports.updateIssueController = updateIssueController;
// DELETE /api/issues/:id
const deleteIssueController = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid issue ID');
            return;
        }
        await (0, issues_service_1.deleteIssue)(id);
        (0, response_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, 'Issue deleted successfully');
    }
    catch (error) {
        const err = error;
        if (err.message === 'ISSUE_NOT_FOUND') {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Issue not found');
            return;
        }
        next(error);
    }
};
exports.deleteIssueController = deleteIssueController;

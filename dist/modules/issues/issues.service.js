"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIssue = exports.updateIssue = exports.getIssueById = exports.getAllIssues = exports.createIssue = void 0;
const db_1 = __importDefault(require("../../config/db"));
const fetchReporter = async (reporterId) => {
    const result = await db_1.default.query('SELECT id, name, role FROM users WHERE id = $1', [reporterId]);
    return result.rows[0] || null;
};
const createIssue = async (input) => {
    const { title, description, type, reporterId } = input;
    // Validation
    if (!['bug', 'feature_request'].includes(type)) {
        throw new Error('INVALID_TYPE');
    }
    if (title.length > 150) {
        throw new Error('TITLE_TOO_LONG');
    }
    if (description.length < 20) {
        throw new Error('DESCRIPTION_TOO_SHORT');
    }
    const userCheck = await db_1.default.query('SELECT id FROM users WHERE id = $1', [reporterId]);
    if (userCheck.rows.length === 0) {
        throw new Error('REPORTER_NOT_FOUND');
    }
    const result = await db_1.default.query(`INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [title, description, type, reporterId]);
    return result.rows[0];
};
exports.createIssue = createIssue;
const getAllIssues = async (sort = 'newest', type, status) => {
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    if (type) {
        conditions.push(`type = $${paramIndex++}`);
        values.push(type);
    }
    if (status) {
        conditions.push(`status = $${paramIndex++}`);
        values.push(status);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause = sort === 'oldest' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC';
    const result = await db_1.default.query(`SELECT * FROM issues ${whereClause} ${orderClause}`, values);
    const issues = result.rows;
    if (issues.length === 0)
        return [];
    const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
    const reportersResult = await db_1.default.query('SELECT id, name, role FROM users WHERE id = ANY($1::int[])', [reporterIds]);
    const reporterMap = {};
    reportersResult.rows.forEach((r) => {
        reporterMap[r.id] = r;
    });
    return issues.map((issue) => {
        const { reporter_id, ...rest } = issue;
        return {
            ...rest,
            reporter: reporterMap[reporter_id] || null,
        };
    });
};
exports.getAllIssues = getAllIssues;
const getIssueById = async (id) => {
    const result = await db_1.default.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (result.rows.length === 0) {
        throw new Error('ISSUE_NOT_FOUND');
    }
    const issue = result.rows[0];
    const reporter = await fetchReporter(issue.reporter_id);
    const { reporter_id, ...rest } = issue;
    return { ...rest, reporter };
};
exports.getIssueById = getIssueById;
const updateIssue = async (issueId, requesterId, requesterRole, input) => {
    const issueResult = await db_1.default.query('SELECT * FROM issues WHERE id = $1', [issueId]);
    if (issueResult.rows.length === 0) {
        throw new Error('ISSUE_NOT_FOUND');
    }
    const issue = issueResult.rows[0];
    if (requesterRole === 'contributor') {
        if (issue.reporter_id !== requesterId) {
            throw new Error('FORBIDDEN');
        }
        if (issue.status !== 'open') {
            throw new Error('ISSUE_NOT_OPEN');
        }
    }
    // Validation
    if (input.type && !['bug', 'feature_request'].includes(input.type)) {
        throw new Error('INVALID_TYPE');
    }
    if (input.title && input.title.length > 150) {
        throw new Error('TITLE_TOO_LONG');
    }
    if (input.description && input.description.length < 20) {
        throw new Error('DESCRIPTION_TOO_SHORT');
    }
    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (input.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(input.title);
    }
    if (input.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(input.description);
    }
    if (input.type !== undefined) {
        updates.push(`type = $${paramIndex++}`);
        values.push(input.type);
    }
    updates.push(`updated_at = NOW()`);
    values.push(issueId);
    const result = await db_1.default.query(`UPDATE issues SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0];
};
exports.updateIssue = updateIssue;
const deleteIssue = async (issueId) => {
    const result = await db_1.default.query('DELETE FROM issues WHERE id = $1 RETURNING id', [issueId]);
    if (result.rows.length === 0) {
        throw new Error('ISSUE_NOT_FOUND');
    }
};
exports.deleteIssue = deleteIssue;

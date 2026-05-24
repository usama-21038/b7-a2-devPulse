"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const issues_controller_1 = require("./issues.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', issues_controller_1.getAllIssuesController);
router.get('/:id', issues_controller_1.getIssueByIdController);
// Authenticated routes
router.post('/', auth_middleware_1.authenticate, issues_controller_1.createIssueController);
router.patch('/:id', auth_middleware_1.authenticate, issues_controller_1.updateIssueController);
// Maintainer only
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireMaintainer, issues_controller_1.deleteIssueController);
exports.default = router;

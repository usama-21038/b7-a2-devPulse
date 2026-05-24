"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMaintainer = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const response_1 = require("../utils/response");
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authorization token missing');
        return;
    }
    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch {
        (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
    }
};
exports.authenticate = authenticate;
const requireMaintainer = (req, res, next) => {
    if (req.user?.role !== 'maintainer') {
        (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.FORBIDDEN, 'Access denied. Maintainer role required');
        return;
    }
    next();
};
exports.requireMaintainer = requireMaintainer;

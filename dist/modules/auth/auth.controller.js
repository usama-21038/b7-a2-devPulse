"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const http_status_codes_1 = require("http-status-codes");
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
// POST /api/auth/signup
const signup = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        // Validation
        if (!name || !email || !password) {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, 'Name, email and password are required');
            return;
        }
        const user = await (0, auth_service_1.registerUser)({ name, email, password, role });
        (0, response_1.sendSuccess)(res, http_status_codes_1.StatusCodes.CREATED, 'User registered successfully', user);
    }
    catch (error) {
        const err = error;
        if (err.message === 'EMAIL_EXISTS') {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already registered');
            return;
        }
        if (err.message === 'INVALID_ROLE') {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, 'Role must be contributor or maintainer');
            return;
        }
        next(error);
    }
};
exports.signup = signup;
// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email and password are required');
            return;
        }
        const data = await (0, auth_service_1.loginUser)({ email, password });
        (0, response_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, 'Login successful', data);
    }
    catch (error) {
        const err = error;
        if (err.message === 'INVALID_CREDENTIALS') {
            (0, response_1.sendError)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid email or password');
            return;
        }
        next(error);
    }
};
exports.login = login;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
        errors: err.message,
    });
};
exports.errorMiddleware = errorMiddleware;

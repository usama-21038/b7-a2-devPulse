"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const issues_routes_1 = __importDefault(require("./modules/issues/issues.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const db_1 = require("./config/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
    // res.send('Welcome to the DevPulse!');
    res.json({
        message: 'Welcome to the DevPulse!',
        author: "Next level developer"
    });
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/issues', issues_routes_1.default);
app.use(error_middleware_1.errorMiddleware);
app.listen(PORT, () => {
    (0, db_1.initDB)();
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;

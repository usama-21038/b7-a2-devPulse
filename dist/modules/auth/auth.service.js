"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../../config/db"));
const registerUser = async (input) => {
    const { name, email, password, role = 'contributor' } = input;
    if (!['contributor', 'maintainer'].includes(role)) {
        throw new Error('INVALID_ROLE');
    }
    const existingUser = await db_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw new Error('EMAIL_EXISTS');
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const result = await db_1.default.query(`INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`, [name, email, hashedPassword, role]);
    return result.rows[0];
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    const { email, password } = input;
    const result = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        throw new Error('INVALID_CREDENTIALS');
    }
    const user = result.rows[0];
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('INVALID_CREDENTIALS');
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};
exports.loginUser = loginUser;

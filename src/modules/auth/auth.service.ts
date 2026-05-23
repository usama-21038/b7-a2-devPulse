import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/db';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

// নতুন user register করার logic
export const registerUser = async (input: RegisterInput) => {
  const { name, email, password, role = 'contributor' } = input;

  // Role validate করা
  if (!['contributor', 'maintainer'].includes(role)) {
    throw new Error('INVALID_ROLE');
  }

  // Email আগে থেকে আছে কিনা check করা
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('EMAIL_EXISTS');
  }

  // Password hash করা (salt rounds: 10)
  const hashedPassword = await bcrypt.hash(password, 10);

  // নতুন user insert করা
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};

// User login করার logic
export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  // Email দিয়ে user খোঁজা
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const user = result.rows[0];

  // Password মিলছে কিনা check করা
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // JWT token তৈরি করা - payload-এ id, name, role রাখা হচ্ছে
  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  // Password বাদ দিয়ে user data return করা
  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};
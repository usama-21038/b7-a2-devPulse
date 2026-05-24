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


export const registerUser = async (input: RegisterInput) => {
  const { name, email, password, role = 'contributor' } = input;


  if (!['contributor', 'maintainer'].includes(role)) {
    throw new Error('INVALID_ROLE');
  }


  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('EMAIL_EXISTS');
  }


  const hashedPassword = await bcrypt.hash(password, 10);


  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;


  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS');
  }


  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );


  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};
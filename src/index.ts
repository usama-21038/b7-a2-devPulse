import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import issueRoutes from './modules/issues/issues.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { initDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Global Error Handler (সবার শেষে থাকবে)
app.use(errorMiddleware);

app.listen(PORT, () => {
    initDB();
  console.log(`Server running on port ${PORT}`);
});

export default app;
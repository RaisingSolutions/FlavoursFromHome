import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import testRoutes from './routes/testRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', testRoutes);

export default app;
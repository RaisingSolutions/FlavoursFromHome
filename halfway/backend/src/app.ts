import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import authRoutes from './routes/authRoutes';
import shiftRoutes from './routes/shiftRoutes';
import userRoutes from './routes/userRoutes';
import paymentRoutes from './routes/paymentRoutes';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5174'];
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Halfway House API Docs'
}));

app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

export default app;

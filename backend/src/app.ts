import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import testRoutes from './routes/testRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import adminRoutes from './routes/adminRoutes';
import orderRoutes from './routes/orderRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import paymentRoutes from './routes/paymentRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import dealRoutes from './routes/dealRoutes';
import eventRoutes from './routes/eventRoutes';
import organiserRoutes from './routes/organiserRoutes';

const app = express();

// Middleware
const corsOrigin = process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
app.use(cors({ origin: corsOrigin }));

// Stripe webhook needs raw body
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Flavours From Home API Docs'
}));

// Routes
app.use('/api', testRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/organiser', organiserRoutes);

export default app;
import express from 'express';
import cors from 'cors';
import testRoutes from './routes/testRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import adminRoutes from './routes/adminRoutes';
import orderRoutes from './routes/orderRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import paymentRoutes from './routes/paymentRoutes';

const app = express();

// Middleware
const corsOrigin = process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
app.use(cors({ origin: corsOrigin }));

// Stripe webhook needs raw body
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Routes
app.use('/api', testRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payment', paymentRoutes);

export default app;
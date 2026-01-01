"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const deliveryRoutes_1 = __importDefault(require("./routes/deliveryRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
const app = (0, express_1.default)();
// Middleware
const corsOrigin = process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
app.use((0, cors_1.default)({ origin: corsOrigin }));
// Stripe webhook needs raw body
app.use('/api/payment/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json());
// Routes
app.use('/api', testRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/delivery', deliveryRoutes_1.default);
app.use('/api/payment', paymentRoutes_1.default);
app.use('/api/feedback', feedbackRoutes_1.default);
exports.default = app;

# Flavours From Home - API Documentation

Complete API documentation for the Flavours From Home e-commerce platform.

## 📚 Documentation Access

### Main Backend API
- **Development**: http://localhost:3000/api-docs
- **Production**: https://api.flavoursfromhome.com/api-docs

### Halfway House API
- **Development**: http://localhost:3001/api-docs
- **Production**: https://halfway.flavoursfromhome.com/api-docs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (via Supabase)
- Stripe Account (for payments)

### Installation

#### Main Backend
```bash
cd backend
npm install
npm run dev
```

#### Halfway Backend
```bash
cd halfway/backend
npm install
npm run dev
```

## 📖 API Overview

### Main Backend APIs

#### 1. Test API
- `GET /api/status` - Check API health

#### 2. Products API
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:categoryId` - Get products by category
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `PUT /api/products/:id/toggle` - Toggle product status
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/record-delivery` - Record product delivery
- `GET /api/products/deliveries/history` - Get delivery history

#### 3. Categories API
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `PUT /api/categories/:id/toggle` - Toggle category status
- `DELETE /api/categories/:id` - Delete category

#### 4. Orders API
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order and refund

#### 5. Admin API
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - Get all admin users
- `GET /api/admin/drivers` - Get all drivers
- `POST /api/admin/users` - Create admin user (Super Admin only)
- `POST /api/admin/drivers` - Create driver (Super Admin only)
- `PUT /api/admin/users/:id/status` - Update admin status (Super Admin only)
- `DELETE /api/admin/users/:id` - Delete admin user (Super Admin only)

#### 6. Delivery API
- `POST /api/delivery/generate-routes` - Generate delivery routes
- `POST /api/delivery/generate-routes-from-orders` - Generate routes from orders
- `POST /api/delivery/assign-route` - Assign route to driver
- `GET /api/delivery/driver-deliveries` - Get driver deliveries
- `PUT /api/delivery/mark-delivered/:id` - Mark order as delivered

#### 7. Payment API
- `POST /api/payment/create-checkout-session` - Create Stripe checkout
- `POST /api/payment/webhook` - Stripe webhook handler
- `POST /api/payment/verify-coupon` - Verify coupon code

#### 8. Feedback API
- `GET /api/feedback/order/:orderId` - Get order for feedback
- `POST /api/feedback/submit` - Submit customer feedback
- `GET /api/feedback/all` - Get all feedbacks

### Halfway House APIs

#### 1. Auth API
- `POST /api/auth/login` - User login

#### 2. Users API
- `POST /api/users` - Create new user
- `GET /api/users` - Get all users
- `PUT /api/users/:id/password` - Update user password
- `DELETE /api/users/:id` - Delete user

#### 3. Shifts API
- `POST /api/shifts` - Create new shift
- `GET /api/shifts` - Get all shifts
- `GET /api/shifts/user/:userId` - Get user shifts

## 🔐 Authentication

### Admin Authentication
Super Admin endpoints require authentication. Include the admin credentials in the request.

**Login Request:**
```json
POST /api/admin/login
{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "is_super_admin": true,
  "role": "admin",
  "message": "Login successful"
}
```

## 📝 Request Examples

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+447123456789",
    "address": "123 Main St, London",
    "payment_method": "ONLINE",
    "total_amount": 45.99,
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      }
    ]
  }'
```

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicken Curry",
    "description": "Delicious homemade curry",
    "price": 12.99,
    "category_id": 1,
    "weight": "500g",
    "image_url": "https://example.com/image.jpg",
    "inventory": 50,
    "has_limit": true,
    "max_per_order": 5
  }'
```

## 🗄️ Database Schema

### Main Tables
- **products** - Product catalog
- **categories** - Product categories
- **orders** - Customer orders
- **order_items** - Order line items
- **admin_users** - Admin and driver accounts
- **feedbacks** - Customer feedback
- **deliveries** - Product deliveries
- **delivery_items** - Delivery line items

### Halfway Tables
- **users** - Halfway house users
- **shifts** - User shift records

## 🔧 Environment Variables

### Main Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
ADMIN_PHONE_NUMBER=+447123456789
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### Halfway Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
CORS_ORIGIN=http://localhost:5174
```

## 📊 Response Formats

### Success Response
```json
{
  "id": 1,
  "name": "Product Name",
  "price": 12.99
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## 🎯 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 🔄 Order Status Flow

1. **pending** - Order created
2. **confirmed** - Order confirmed by admin
3. **delivered** - Order delivered to customer
4. **cancelled** - Order cancelled (refund processed)

## 💳 Payment Methods

- **CASH** - Cash on delivery
- **ONLINE** - Stripe payment

## 📧 Notifications

The system sends WhatsApp notifications for:
- Order confirmations
- Order status updates
- Low inventory alerts

## 🚚 Delivery Management

The delivery system includes:
- Route optimization
- Driver assignment
- Real-time delivery tracking
- Delivery confirmation

## ⭐ Feedback System

Customers can provide:
- Overall order rating (1-5 stars)
- Individual product ratings
- Written comments

## 🛠️ Development

### Build
```bash
npm run build
```

### Start Production
```bash
npm start
```

### Run Tests
```bash
npm test
```

## 📦 Dependencies

### Main Backend
- express - Web framework
- @supabase/supabase-js - Database client
- stripe - Payment processing
- bcrypt - Password hashing
- nodemailer - Email notifications
- swagger-jsdoc - API documentation
- swagger-ui-express - API documentation UI

### Halfway Backend
- express - Web framework
- @supabase/supabase-js - Database client
- bcrypt - Password hashing
- swagger-jsdoc - API documentation
- swagger-ui-express - API documentation UI

## 📞 Support

For API support or questions, contact: support@flavoursfromhome.com

## 📄 License

Proprietary - All rights reserved

---

**Last Updated:** 2024
**Version:** 1.0.0

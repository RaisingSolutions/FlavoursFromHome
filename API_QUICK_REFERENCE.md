# API Quick Reference Guide

## 🌐 Base URLs

| Service | Development | Production |
|---------|-------------|------------|
| Main API | http://localhost:3000 | https://api.flavoursfromhome.com |
| Halfway API | http://localhost:3001 | https://halfway.flavoursfromhome.com |
| Swagger Docs | /api-docs | /api-docs |

## 📋 Main API Endpoints

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/products | Get all products | No |
| GET | /api/products/:id | Get product by ID | No |
| GET | /api/products/category/:categoryId | Get products by category | No |
| POST | /api/products | Create product | No |
| PUT | /api/products/:id | Update product | No |
| PUT | /api/products/:id/toggle | Toggle product status | No |
| DELETE | /api/products/:id | Delete product | No |
| POST | /api/products/record-delivery | Record delivery | No |
| GET | /api/products/deliveries/history | Get deliveries | No |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/categories | Get all categories | No |
| POST | /api/categories | Create category | No |
| PUT | /api/categories/:id | Update category | No |
| PUT | /api/categories/:id/toggle | Toggle status | No |
| DELETE | /api/categories/:id | Delete category | No |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/orders | Get all orders | No |
| POST | /api/orders | Create order | No |
| PUT | /api/orders/:id/status | Update status | No |
| POST | /api/orders/:id/cancel | Cancel order | No |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/admin/login | Admin login | No |
| GET | /api/admin/users | Get admin users | No |
| GET | /api/admin/drivers | Get drivers | No |
| POST | /api/admin/users | Create admin | Super Admin |
| POST | /api/admin/drivers | Create driver | Super Admin |
| PUT | /api/admin/users/:id/status | Update status | Super Admin |
| DELETE | /api/admin/users/:id | Delete admin | Super Admin |

### Delivery
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/delivery/generate-routes | Generate routes | No |
| POST | /api/delivery/generate-routes-from-orders | Routes from orders | No |
| POST | /api/delivery/assign-route | Assign route | No |
| GET | /api/delivery/driver-deliveries | Get deliveries | No |
| PUT | /api/delivery/mark-delivered/:id | Mark delivered | No |

### Payment
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/payment/create-checkout-session | Create checkout | No |
| POST | /api/payment/webhook | Stripe webhook | No |
| POST | /api/payment/verify-coupon | Verify coupon | No |

### Feedback
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/feedback/order/:orderId | Get order | No |
| POST | /api/feedback/submit | Submit feedback | No |
| GET | /api/feedback/all | Get all feedback | No |

## 📋 Halfway API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | User login | No |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/users | Create user | No |
| GET | /api/users | Get all users | No |
| PUT | /api/users/:id/password | Update password | No |
| DELETE | /api/users/:id | Delete user | No |

### Shifts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/shifts | Create shift | No |
| GET | /api/shifts | Get all shifts | No |
| GET | /api/shifts/user/:userId | Get user shifts | No |

## 📦 Common Request Bodies

### Create Order
```json
{
  "first_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+447123456789",
  "address": "123 Main St, London",
  "payment_method": "ONLINE",
  "total_amount": 45.99,
  "items": [
    { "product_id": 1, "quantity": 2 }
  ]
}
```

### Create Product
```json
{
  "name": "Product Name",
  "description": "Description",
  "price": 12.99,
  "category_id": 1,
  "weight": "500g",
  "image_url": "https://...",
  "inventory": 50,
  "has_limit": true,
  "max_per_order": 5
}
```

### Admin Login
```json
{
  "username": "admin",
  "password": "password"
}
```

### Submit Feedback
```json
{
  "order_id": 1,
  "overall_rating": 5,
  "product_ratings": {
    "1": { "rating": 5, "comment": "Great!" }
  },
  "comments": "Excellent service"
}
```

### Create Shift
```json
{
  "user_id": 1,
  "shift_date": "2024-01-15",
  "start_time": "09:00",
  "end_time": "17:00"
}
```

## 🔑 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

## 📊 Order Statuses

- `pending` - Order created
- `confirmed` - Order confirmed
- `delivered` - Order delivered
- `cancelled` - Order cancelled

## 💳 Payment Methods

- `CASH` - Cash on delivery
- `ONLINE` - Stripe payment

## 🚀 Quick Start

1. Start backend: `cd backend && npm run dev`
2. Start halfway: `cd halfway/backend && npm run dev`
3. Access docs: http://localhost:3000/api-docs
4. Test API: `curl http://localhost:3000/api/status`

## 📝 Notes

- All timestamps are in ISO 8601 format
- Phone numbers should include country code
- Prices are in GBP (£)
- Images should be hosted URLs
- Super Admin endpoints require authentication

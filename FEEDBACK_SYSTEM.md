# Feedback System Documentation

## Overview
When an order is marked as "delivered", customers receive an email with a feedback link. After submitting feedback, they get a £5 voucher code.

## How It Works

### 1. Order Delivery
- Admin marks order as "delivered" in the admin panel
- System automatically sends feedback request email to customer
- Email contains link: `https://flavours-from-home.co.uk/feedback?order=ORDER_ID`

### 2. Feedback Page
Customer can rate:
- Each product (1-5 stars + optional comments)
- Delivery service (1-5 stars)
- Driver (1-5 stars)
- Additional comments (optional)

### 3. Voucher Generation
- On first submission: System generates unique coupon code (e.g., FFH12ABC34)
- Coupon is emailed to customer
- £5 voucher valid for 6 months
- Order marked as `feedback_submitted = true`

### 4. Duplicate Prevention
- If customer tries to submit again for same order
- Shows message: "Thanks for submitting your feedback! You've already received your voucher for this order."

## Database Schema

### Orders Table
```sql
ALTER TABLE orders ADD COLUMN feedback_submitted BOOLEAN DEFAULT FALSE;
```

### Feedbacks Table
```sql
CREATE TABLE feedbacks (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_ratings JSONB NOT NULL,
  delivery_rating INTEGER CHECK (1-5),
  driver_rating INTEGER CHECK (1-5),
  delivery_comments TEXT,
  created_at TIMESTAMP
);
```

### Coupons Table
```sql
CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

## API Endpoints

### GET /api/feedback/order/:orderId
Fetch order details for feedback form
- Returns order with products if not yet submitted
- Returns feedback_submitted status

### POST /api/feedback/submit
Submit feedback and generate coupon
```json
{
  "orderId": 123,
  "productRatings": {
    "1": { "rating": 5, "comment": "Great!" },
    "2": { "rating": 4, "comment": "Good" }
  },
  "deliveryRating": 5,
  "driverRating": 5,
  "deliveryComments": "Fast delivery"
}
```

## Setup Instructions

### 1. Apply Database Schema
```bash
cd backend
psql -U your_user -d your_database -f feedback-system.sql
```

### 2. Environment Variables
Ensure these are set in backend/.env:
```
EMAIL_USER=admin@flavours-from-home.co.uk
EMAIL_PASSWORD=your_password
```

### 3. Frontend URL
Update in backend if needed:
```typescript
const feedbackUrl = `https://flavours-from-home.co.uk/feedback?order=${orderId}`;
```

## Next Steps (Future Implementation)
- [ ] Validate coupon codes during checkout
- [ ] Apply £5 discount when valid coupon is used
- [ ] Mark coupon as `used = true` after redemption
- [ ] Show coupon history in customer account

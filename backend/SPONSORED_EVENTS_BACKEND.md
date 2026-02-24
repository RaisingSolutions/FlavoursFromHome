# Sponsored Events Backend Setup

## ✅ Completed Backend Tasks

### 1. Database Schema
- Created `sponsored-events-schema.sql` with 4 tables
- Run in Supabase ✓

### 2. Controllers Created
- `eventController.ts` - Event operations & bookings
- `organiserController.ts` - Organiser auth & dashboard
- Updated `paymentController.ts` - Event discount code support

### 3. Routes Created
- `eventRoutes.ts` - Event API endpoints
- `organiserRoutes.ts` - Organiser API endpoints

### 4. Middleware
- `organiserAuth.ts` - JWT authentication for organisers

### 5. Email Functions
- `sendEventConfirmationEmail` - Booking confirmation + first discount code
- `sendMonthlyDiscountCode` - Monthly discount code emails

### 6. Cron Job
- `discountCron.ts` - Generates monthly codes (runs daily at 9 AM)

### 7. Dependencies Installed
- `node-cron` - Cron job scheduler
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Already installed

## 🔧 Environment Variables Required

Add to `/backend/.env`:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 📡 API Endpoints

### Events
- `GET /api/events` - List all active events
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/book` - Book event tickets
- `POST /api/events/discount/validate` - Validate event discount code

### Organiser
- `POST /api/organiser/login` - Login
- `POST /api/organiser/create` - Create organiser (admin only)
- `GET /api/organiser/dashboard/:eventId` - Get dashboard stats (auth required)
- `GET /api/organiser/export/:eventId` - Export attendees CSV (auth required)

### Payment (Updated)
- `POST /api/payment/verify-coupon` - Now supports event discount codes

## 🎯 How It Works

### Event Booking Flow:
1. User selects tickets on event page
2. Stripe checkout session created
3. On successful payment:
   - Booking record created
   - Ticket counts updated
   - First discount code generated (Month 1)
   - Email sent with code

### Monthly Discount Flow:
1. Cron job runs daily at 9 AM
2. Checks all bookings for users needing next month's code
3. Generates code if 30 days passed since last code
4. Sends email with new code
5. Continues for 12 months

### Discount Code Usage:
1. User enters code at checkout
2. System validates: not expired, not used
3. Applies 15% discount (max £40)
4. Marks code as redeemed
5. Links to order

## 🔐 Creating an Organiser

Run this SQL in Supabase (replace values):

```sql
-- First, hash a password using bcrypt (use online tool or Node.js)
-- Example: bcrypt.hash('password123', 10)

INSERT INTO public.event_organisers (email, password_hash, assigned_event_id) 
VALUES ('organiser@latte.com', '$2b$10$HASHED_PASSWORD_HERE', 1);
```

Or use the API endpoint (requires admin setup):
```bash
POST /api/organiser/create
{
  "email": "organiser@latte.com",
  "password": "password123",
  "eventId": 1
}
```

## 🧪 Testing

1. Start backend: `npm run dev`
2. Check cron job started: Look for "Discount code cron job started" in console
3. Test event booking: Use frontend or Postman
4. Test organiser login: POST to `/api/organiser/login`

## ⚠️ Important Notes

- Cron job runs daily at 9 AM (can be changed in `discountCron.ts`)
- Event discount codes: 15% off, max £40 discount
- Codes expire after 30 days
- Each code can only be used once
- Refunds will need manual handling (cancel future codes)

## 🚀 Next Steps

1. Add `JWT_SECRET` to `.env`
2. Restart backend server
3. Create organiser account for Latte event
4. Move to frontend implementation

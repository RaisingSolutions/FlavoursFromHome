# Event Booking Updates - Setup Guide

## New Features Added ✅

1. **Event Discount Coupons** - For testers in staging
2. **Free Visiting Parents Tickets** - No charge for parents

---

## Step 1: Run Database Updates

Run this SQL in your Supabase database:

```sql
-- Add event discount coupons table for testing
CREATE TABLE public.event_coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add visiting parents capacity to events table
ALTER TABLE public.events 
ADD COLUMN parent_capacity INTEGER DEFAULT 0,
ADD COLUMN parent_sold INTEGER DEFAULT 0;

-- Update existing event with parent capacity
UPDATE public.events 
SET parent_capacity = 50, parent_sold = 0 
WHERE id = 1;

-- Add parent tickets to bookings
ALTER TABLE public.event_bookings 
ADD COLUMN parent_tickets INTEGER DEFAULT 0;

-- Insert sample test coupon (50% off for testers)
INSERT INTO public.event_coupons (code, discount_percentage, max_uses, is_active)
VALUES ('TEST50', 50, 100, true);

-- Insert another coupon (20% off, unlimited uses)
INSERT INTO public.event_coupons (code, discount_percentage, is_active)
VALUES ('WELCOME20', 20, true);
```

---

## Step 2: Restart Backend

```bash
cd backend
npm run dev
```

---

## Step 3: Test the Features

### Test Event Coupon:

1. Go to: http://localhost:5173?page=events
2. Click "Book Tickets"
3. Select tickets (Adult/Child/Parents)
4. Enter coupon code: **TEST50** (50% off)
5. Click "Apply"
6. See discount applied
7. Complete booking

### Test Visiting Parents:

1. On booking page, scroll to "Visiting Parents" section
2. It shows **FREE** with green background
3. Select number of parent tickets
4. They're added to booking but don't affect price
5. Complete booking

---

## Available Coupons:

| Code | Discount | Max Uses | Status |
|------|----------|----------|--------|
| TEST50 | 50% | 100 | Active |
| WELCOME20 | 20% | Unlimited | Active |

---

## How It Works:

### Event Coupons:
1. User enters coupon code at booking
2. System validates: active, not exceeded max uses
3. Applies percentage discount to (Adult + Child tickets only)
4. Parents tickets remain FREE
5. Increments usage count after successful booking

### Visiting Parents:
1. FREE tickets for parents
2. Separate capacity tracking
3. Included in booking confirmation
4. Counted in dashboard stats

---

## Create New Coupons:

```sql
INSERT INTO public.event_coupons (code, discount_percentage, max_uses, is_active)
VALUES ('YOUR_CODE', 30, 50, true);
```

Parameters:
- `code`: Coupon code (uppercase recommended)
- `discount_percentage`: 1-100
- `max_uses`: NULL for unlimited, or set a number
- `is_active`: true/false

---

## Dashboard Updates:

Organiser dashboard now shows:
- Adult tickets sold/remaining
- Child tickets sold/remaining
- **Parent tickets sold/remaining** (NEW)
- Total revenue (parents don't affect this)

---

## Testing Checklist:

- [ ] Database updates run successfully
- [ ] Backend restarted
- [ ] Can apply TEST50 coupon (50% off)
- [ ] Can apply WELCOME20 coupon (20% off)
- [ ] Can select parent tickets (FREE)
- [ ] Discount applies to adult+child only
- [ ] Parents don't affect total price
- [ ] Booking saves with all ticket types
- [ ] Email confirmation includes all tickets
- [ ] Dashboard shows parent ticket counts

---

## Notes:

- Coupons apply to **paid tickets only** (Adult + Child)
- Parents are always **FREE**
- Coupon usage is tracked and limited
- Invalid/expired coupons show error message
- Can't combine multiple coupons

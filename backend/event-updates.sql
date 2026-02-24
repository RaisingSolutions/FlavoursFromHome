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

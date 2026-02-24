-- Sponsored Events Feature Schema
-- Run this SQL in your Supabase database

-- Table 1: Events
CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR NOT NULL,
  venue_address TEXT,
  image_url TEXT,
  sponsor_name VARCHAR NOT NULL,
  adult_price NUMERIC NOT NULL,
  child_price NUMERIC NOT NULL,
  adult_capacity INTEGER NOT NULL,
  child_capacity INTEGER NOT NULL,
  adult_sold INTEGER DEFAULT 0,
  child_sold INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Event Bookings
CREATE TABLE public.event_bookings (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES public.events(id),
  user_email VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  phone_number VARCHAR NOT NULL,
  adult_tickets INTEGER DEFAULT 0,
  child_tickets INTEGER DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  stripe_session_id VARCHAR,
  marketing_consent BOOLEAN DEFAULT false,
  booking_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: Event Discount Codes (12-month program)
CREATE TABLE public.event_discount_codes (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES public.event_bookings(id),
  user_email VARCHAR NOT NULL,
  code VARCHAR NOT NULL UNIQUE,
  issue_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP NOT NULL,
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  redeemed BOOLEAN DEFAULT false,
  redemption_date TIMESTAMP,
  order_id INTEGER REFERENCES public.orders(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 4: Event Organisers
CREATE TABLE public.event_organisers (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  assigned_event_id INTEGER NOT NULL REFERENCES public.events(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_event_bookings_email ON public.event_bookings(user_email);
CREATE INDEX idx_event_bookings_event ON public.event_bookings(event_id);
CREATE INDEX idx_discount_codes_email ON public.event_discount_codes(user_email);
CREATE INDEX idx_discount_codes_code ON public.event_discount_codes(code);
CREATE INDEX idx_discount_codes_booking ON public.event_discount_codes(booking_id);
CREATE INDEX idx_organisers_email ON public.event_organisers(email);

-- Insert sample event (Latte Ugadi)
INSERT INTO public.events (
  name, 
  description, 
  event_date, 
  location, 
  venue_address,
  sponsor_name, 
  adult_price, 
  child_price, 
  adult_capacity, 
  child_capacity,
  image_url
) VALUES (
  'Latte Ugadi Festival 2025',
  'Celebrate the Telugu New Year with traditional food, music, and cultural performances. Join us for an unforgettable evening of festivities!',
  '2025-03-30 18:00:00',
  'Leeds',
  'Leeds City Centre, LS1 1AA',
  'Latte',
  25.00,
  15.00,
  200,
  100,
  'https://res.cloudinary.com/dulm4r5mo/image/upload/v1763129727/FFH_Logo_f47yft.png'
);

-- Note: To create an organiser, use the API endpoint or run:
-- INSERT INTO public.event_organisers (email, password_hash, assigned_event_id) 
-- VALUES ('organiser@example.com', 'HASHED_PASSWORD_HERE', 1);

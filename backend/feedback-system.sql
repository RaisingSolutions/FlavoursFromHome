-- Add feedback_submitted column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS feedback_submitted BOOLEAN DEFAULT FALSE;

-- Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_ratings JSONB NOT NULL,
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  delivery_comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

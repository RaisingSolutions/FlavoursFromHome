-- Create payments table
CREATE TABLE IF NOT EXISTS halfway_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES halfway_users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  amount DECIMAL(10, 2) DEFAULT 0,
  account VARCHAR(100),
  comments TEXT,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_payments_user_month ON halfway_payments(user_id, month);

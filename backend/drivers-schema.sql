-- Add driver role to admin_users table (if role column doesn't exist)
-- ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';

-- Update existing admin_users to have roles
-- UPDATE admin_users SET role = 'super_admin' WHERE is_super_admin = true;
-- UPDATE admin_users SET role = 'admin' WHERE is_super_admin = false;

-- Delivery routes table
CREATE TABLE IF NOT EXISTS delivery_routes (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES admin_users(id),
  route_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'assigned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add driver_id and route_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_id INTEGER REFERENCES admin_users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS route_id INTEGER REFERENCES delivery_routes(id);

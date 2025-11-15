-- Add role column to admin_users
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';

-- Update existing users
UPDATE admin_users SET role = 'super_admin' WHERE is_super_admin = true;
UPDATE admin_users SET role = 'admin' WHERE is_super_admin = false AND role IS NULL;

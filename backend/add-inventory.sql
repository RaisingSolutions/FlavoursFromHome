-- Add inventory column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory INTEGER DEFAULT 0;

-- Set default inventory for existing products (you can update these manually)
UPDATE products SET inventory = 100 WHERE inventory = 0;

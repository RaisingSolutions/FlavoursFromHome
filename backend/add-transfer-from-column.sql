-- Add transfer_from column to deliveries table for stock transfers
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS transfer_from VARCHAR(50);

-- Migration: Remove individual booking limits and use single 400 capacity
-- This script removes adult_capacity, child_capacity, parent_capacity, adult_sold, child_sold, parent_sold
-- and replaces them with total_capacity and total_sold

-- Step 1: Add new columns
ALTER TABLE public.events 
ADD COLUMN total_capacity INTEGER DEFAULT 400,
ADD COLUMN total_sold INTEGER DEFAULT 0;

-- Step 2: Migrate existing data (sum up all sold tickets)
UPDATE public.events 
SET total_sold = COALESCE(adult_sold, 0) + COALESCE(child_sold, 0) + COALESCE(parent_sold, 0);

-- Step 3: Set total_capacity based on existing capacities (or default to 400)
UPDATE public.events 
SET total_capacity = COALESCE(adult_capacity, 0) + COALESCE(child_capacity, 0) + COALESCE(parent_capacity, 0);

-- If total_capacity is 0, set it to 400
UPDATE public.events 
SET total_capacity = 400 
WHERE total_capacity = 0;

-- Step 4: Drop old columns
ALTER TABLE public.events 
DROP COLUMN IF EXISTS adult_capacity,
DROP COLUMN IF EXISTS child_capacity,
DROP COLUMN IF EXISTS parent_capacity,
DROP COLUMN IF EXISTS adult_sold,
DROP COLUMN IF EXISTS child_sold,
DROP COLUMN IF EXISTS parent_sold;

-- Step 5: Update event_bookings table to remove parent_tickets column
ALTER TABLE public.event_bookings 
DROP COLUMN IF EXISTS parent_tickets;

-- Verification query (run this to check the migration)
-- SELECT id, name, total_capacity, total_sold, (total_capacity - total_sold) as remaining FROM public.events;

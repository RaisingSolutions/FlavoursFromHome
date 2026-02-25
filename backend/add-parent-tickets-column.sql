-- Add parent_tickets column to event_bookings table
ALTER TABLE public.event_bookings 
ADD COLUMN parent_tickets INTEGER DEFAULT 0;

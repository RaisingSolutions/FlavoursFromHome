import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const organiserLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data: organiser, error } = await supabase
      .from('event_organisers')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !organiser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, organiser.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: organiser.id, email: organiser.email, eventId: organiser.assigned_event_id },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, eventId: organiser.assigned_event_id });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getOrganiserDashboard = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const organiser = (req as any).organiser;

    if (organiser.eventId !== parseInt(eventId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from('event_bookings')
      .select('*')
      .eq('event_id', eventId)
      .eq('payment_status', 'paid');

    if (bookingsError) throw bookingsError;

    const totalTicketsSold = event.total_sold;
    const totalRevenue = bookings?.reduce((sum, b) => sum + parseFloat(b.total_amount), 0) || 0;

    const adultTickets = bookings?.reduce((sum, b) => sum + b.adult_tickets, 0) || 0;
    const childTickets = bookings?.reduce((sum, b) => sum + b.child_tickets, 0) || 0;

    res.json({
      event: {
        name: event.name,
        date: event.event_date,
        location: event.location,
      },
      capacity: {
        adult: 0,
        child: 0,
        total: event.total_capacity,
      },
      sold: {
        adult: adultTickets,
        child: childTickets,
        total: totalTicketsSold,
      },
      remaining: {
        adult: 0,
        child: 0,
        total: event.total_capacity - totalTicketsSold,
      },
      revenue: totalRevenue,
      bookings: bookings?.length || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

export const exportAttendees = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const organiser = (req as any).organiser;

    if (organiser.eventId !== parseInt(eventId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: bookings, error } = await supabase
      .from('event_bookings')
      .select('*')
      .eq('event_id', eventId)
      .eq('payment_status', 'paid')
      .order('booking_date', { ascending: true });

    if (error) throw error;

    const csv = [
      'Booking ID,Name,Email,Phone,Adult Tickets,Child Tickets,Total Amount,Booking Date',
      ...(bookings || []).map(b => 
        `${b.id},${b.first_name},${b.user_email},${b.phone_number},${b.adult_tickets},${b.child_tickets},£${b.total_amount},${new Date(b.booking_date).toLocaleString()}`
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendees-${eventId}.csv`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to export attendees' });
  }
};

export const createOrganiser = async (req: Request, res: Response) => {
  try {
    const { email, password, eventId } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: organiser, error } = await supabase
      .from('event_organisers')
      .insert({
        email,
        password_hash: hashedPassword,
        assigned_event_id: eventId,
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, organiserId: organiser.id });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create organiser' });
  }
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganiser = exports.exportAttendees = exports.getOrganiserDashboard = exports.organiserLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../utils/supabase");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const organiserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: organiser, error } = await supabase_1.supabase
            .from('event_organisers')
            .select('*')
            .eq('email', email)
            .eq('is_active', true)
            .single();
        if (error || !organiser) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const validPassword = await bcrypt_1.default.compare(password, organiser.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: organiser.id, email: organiser.email, eventId: organiser.assigned_event_id }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, eventId: organiser.assigned_event_id });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.organiserLogin = organiserLogin;
const getOrganiserDashboard = async (req, res) => {
    try {
        const { eventId } = req.params;
        const organiser = req.organiser;
        if (organiser.eventId !== parseInt(eventId)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { data: event, error: eventError } = await supabase_1.supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();
        if (eventError || !event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const { data: bookings, error: bookingsError } = await supabase_1.supabase
            .from('event_bookings')
            .select('*')
            .eq('event_id', eventId)
            .eq('payment_status', 'paid');
        if (bookingsError)
            throw bookingsError;
        const totalAdultTickets = event.adult_sold;
        const totalChildTickets = event.child_sold;
        const totalRevenue = bookings?.reduce((sum, b) => sum + parseFloat(b.total_amount), 0) || 0;
        res.json({
            event: {
                name: event.name,
                date: event.event_date,
                location: event.location,
            },
            capacity: {
                adult: event.adult_capacity,
                child: event.child_capacity,
                total: event.adult_capacity + event.child_capacity,
            },
            sold: {
                adult: totalAdultTickets,
                child: totalChildTickets,
                total: totalAdultTickets + totalChildTickets,
            },
            remaining: {
                adult: event.adult_capacity - totalAdultTickets,
                child: event.child_capacity - totalChildTickets,
                total: (event.adult_capacity + event.child_capacity) - (totalAdultTickets + totalChildTickets),
            },
            revenue: totalRevenue,
            bookings: bookings?.length || 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
};
exports.getOrganiserDashboard = getOrganiserDashboard;
const exportAttendees = async (req, res) => {
    try {
        const { eventId } = req.params;
        const organiser = req.organiser;
        if (organiser.eventId !== parseInt(eventId)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { data: bookings, error } = await supabase_1.supabase
            .from('event_bookings')
            .select('*')
            .eq('event_id', eventId)
            .eq('payment_status', 'paid')
            .order('booking_date', { ascending: true });
        if (error)
            throw error;
        const csv = [
            'Booking ID,Name,Email,Phone,Adult Tickets,Child Tickets,Total Amount,Booking Date',
            ...(bookings || []).map(b => `${b.id},${b.first_name},${b.user_email},${b.phone_number},${b.adult_tickets},${b.child_tickets},£${b.total_amount},${new Date(b.booking_date).toLocaleString()}`)
        ].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendees-${eventId}.csv`);
        res.send(csv);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export attendees' });
    }
};
exports.exportAttendees = exportAttendees;
const createOrganiser = async (req, res) => {
    try {
        const { email, password, eventId } = req.body;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const { data: organiser, error } = await supabase_1.supabase
            .from('event_organisers')
            .insert({
            email,
            password_hash: hashedPassword,
            assigned_event_id: eventId,
        })
            .select()
            .single();
        if (error)
            throw error;
        res.json({ success: true, organiserId: organiser.id });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create organiser' });
    }
};
exports.createOrganiser = createOrganiser;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEventWebhook = exports.generateDiscountCode = exports.createFreeEventBooking = exports.validateEventCoupon = exports.validateEventDiscount = exports.createEventBooking = exports.getEventById = exports.getEvents = void 0;
const stripe_1 = __importDefault(require("stripe"));
const supabase_1 = require("../utils/supabase");
const email_1 = require("../utils/email");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' });
const getEvents = async (req, res) => {
    try {
        const { data: events, error } = await supabase_1.supabase
            .from('events')
            .select('*')
            .eq('status', 'active')
            .order('event_date', { ascending: true });
        if (error)
            throw error;
        res.json(events || []);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};
exports.getEvents = getEvents;
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: event, error } = await supabase_1.supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        const adultRemaining = event.adult_capacity - event.adult_sold;
        const childRemaining = event.child_capacity - event.child_sold;
        const parentRemaining = event.parent_capacity - event.parent_sold;
        res.json({ ...event, adultRemaining, childRemaining, parentRemaining });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch event' });
    }
};
exports.getEventById = getEventById;
const createEventBooking = async (req, res) => {
    try {
        const { eventId, customerInfo, adultTickets, childTickets, parentTickets, couponCode } = req.body;
        const { data: event, error: eventError } = await supabase_1.supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();
        if (eventError || !event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const adultRemaining = event.adult_capacity - event.adult_sold;
        const childRemaining = event.child_capacity - event.child_sold;
        const parentRemaining = event.parent_capacity - event.parent_sold;
        if (adultTickets > adultRemaining || childTickets > childRemaining || parentTickets > parentRemaining) {
            return res.status(400).json({ error: 'Not enough tickets available' });
        }
        let totalAmount = (adultTickets * event.adult_price) + (childTickets * event.child_price);
        let discountPercentage = 0;
        let appliedCouponCode = '';
        // Check for event coupon
        if (couponCode) {
            const { data: coupon, error: couponError } = await supabase_1.supabase
                .from('event_coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();
            if (!couponError && coupon) {
                if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
                    return res.status(400).json({ error: 'Coupon usage limit reached' });
                }
                discountPercentage = coupon.discount_percentage;
                appliedCouponCode = coupon.code;
                totalAmount = totalAmount * (1 - discountPercentage / 100);
            }
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: `${event.name} - Tickets`,
                            description: `${adultTickets} Adult, ${childTickets} Child, ${parentTickets} Visiting Parents${appliedCouponCode ? ` (${discountPercentage}% off)` : ''}`,
                        },
                        unit_amount: Math.round(totalAmount * 100),
                    },
                    quantity: 1,
                }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${eventId}`,
            metadata: {
                type: 'event_booking',
                eventId: eventId.toString(),
                firstName: customerInfo.firstName,
                email: customerInfo.email,
                phoneNumber: customerInfo.phoneNumber,
                adultTickets: adultTickets.toString(),
                childTickets: childTickets.toString(),
                parentTickets: parentTickets.toString(),
                marketingConsent: customerInfo.marketingConsent.toString(),
                couponCode: appliedCouponCode,
                discountPercentage: discountPercentage.toString(),
            },
        });
        res.json({ sessionId: session.id, url: session.url });
    }
    catch (error) {
        console.error('Event booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};
exports.createEventBooking = createEventBooking;
const validateEventDiscount = async (req, res) => {
    try {
        const { code } = req.body;
        const { data: discount, error } = await supabase_1.supabase
            .from('event_discount_codes')
            .select('*')
            .eq('code', code)
            .single();
        if (error || !discount) {
            return res.status(404).json({ error: 'Invalid discount code' });
        }
        if (discount.redeemed) {
            return res.status(400).json({ error: 'Code already used' });
        }
        if (new Date(discount.expiry_date) < new Date()) {
            return res.status(400).json({ error: 'Code expired' });
        }
        res.json({ code: discount.code, amount: 40, maxDiscount: 40 });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to validate code' });
    }
};
exports.validateEventDiscount = validateEventDiscount;
const validateEventCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const { data: coupon, error } = await supabase_1.supabase
            .from('event_coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single();
        if (error || !coupon) {
            return res.status(404).json({ error: 'Invalid coupon code' });
        }
        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }
        res.json({ code: coupon.code, percentage: coupon.discount_percentage });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
};
exports.validateEventCoupon = validateEventCoupon;
const createFreeEventBooking = async (req, res) => {
    try {
        const { eventId, customerInfo, adultTickets, childTickets, parentTickets, couponCode } = req.body;
        const { data: event, error: eventError } = await supabase_1.supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();
        if (eventError || !event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const { data: booking, error: bookingError } = await supabase_1.supabase
            .from('event_bookings')
            .insert({
            event_id: eventId,
            user_email: customerInfo.email,
            first_name: customerInfo.firstName,
            phone_number: customerInfo.phoneNumber,
            adult_tickets: adultTickets,
            child_tickets: childTickets,
            parent_tickets: parentTickets,
            total_amount: 0,
            payment_status: 'paid',
            stripe_session_id: `free_${Date.now()}`,
            marketing_consent: customerInfo.marketingConsent,
        })
            .select()
            .single();
        if (bookingError)
            throw bookingError;
        if (couponCode) {
            const { data: currentCoupon } = await supabase_1.supabase
                .from('event_coupons')
                .select('used_count')
                .eq('code', couponCode)
                .single();
            await supabase_1.supabase
                .from('event_coupons')
                .update({ used_count: (currentCoupon?.used_count || 0) + 1 })
                .eq('code', couponCode);
        }
        const { data: currentEvent } = await supabase_1.supabase
            .from('events')
            .select('adult_sold, child_sold, parent_sold, sponsor_name')
            .eq('id', eventId)
            .single();
        await supabase_1.supabase
            .from('events')
            .update({
            adult_sold: (currentEvent?.adult_sold || 0) + adultTickets,
            child_sold: (currentEvent?.child_sold || 0) + childTickets,
            parent_sold: (currentEvent?.parent_sold || 0) + parentTickets,
        })
            .eq('id', eventId);
        const code = (0, exports.generateDiscountCode)(currentEvent?.sponsor_name || 'EVENT');
        const issueDate = new Date();
        const expiryDate = new Date(issueDate);
        expiryDate.setDate(expiryDate.getDate() + 30);
        await supabase_1.supabase
            .from('event_discount_codes')
            .insert({
            booking_id: booking.id,
            user_email: customerInfo.email,
            code,
            issue_date: issueDate.toISOString(),
            expiry_date: expiryDate.toISOString(),
            month_number: 1,
        });
        await (0, email_1.sendEventConfirmationEmail)(customerInfo.email, {
            firstName: customerInfo.firstName,
            eventName: currentEvent?.sponsor_name || 'Event',
            adultTickets,
            childTickets,
            totalAmount: 0,
            discountCode: code,
        });
        res.json({ success: true, bookingId: booking.id });
    }
    catch (error) {
        console.error('Free booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};
exports.createFreeEventBooking = createFreeEventBooking;
const generateDiscountCode = (sponsorName) => {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `FFH_${sponsorName.toUpperCase()}_${random}`;
};
exports.generateDiscountCode = generateDiscountCode;
const handleEventWebhook = async (session) => {
    try {
        console.log('=== EVENT WEBHOOK START ===');
        console.log('Session metadata:', session.metadata);
        if (session.metadata.type !== 'event_booking') {
            console.log('Not an event booking, skipping');
            return;
        }
        const eventId = parseInt(session.metadata.eventId);
        const firstName = session.metadata.firstName;
        const email = session.metadata.email;
        const phoneNumber = session.metadata.phoneNumber;
        const adultTickets = parseInt(session.metadata.adultTickets);
        const childTickets = parseInt(session.metadata.childTickets);
        const parentTickets = parseInt(session.metadata.parentTickets || '0');
        const marketingConsent = session.metadata.marketingConsent === 'true';
        const couponCode = session.metadata.couponCode || '';
        const totalAmount = session.amount_total / 100;
        console.log('Creating event booking:', { eventId, email, adultTickets, childTickets, parentTickets });
        const { data: booking, error: bookingError } = await supabase_1.supabase
            .from('event_bookings')
            .insert({
            event_id: eventId,
            user_email: email,
            first_name: firstName,
            phone_number: phoneNumber,
            adult_tickets: adultTickets,
            child_tickets: childTickets,
            parent_tickets: parentTickets,
            total_amount: totalAmount,
            payment_status: 'paid',
            stripe_session_id: session.id,
            marketing_consent: marketingConsent,
        })
            .select()
            .single();
        if (bookingError) {
            console.error('Booking creation error:', bookingError);
            throw bookingError;
        }
        console.log('Booking created:', booking.id);
        // Increment coupon usage if used
        if (couponCode) {
            const { data: currentCoupon } = await supabase_1.supabase
                .from('event_coupons')
                .select('used_count')
                .eq('code', couponCode)
                .single();
            await supabase_1.supabase
                .from('event_coupons')
                .update({ used_count: (currentCoupon?.used_count || 0) + 1 })
                .eq('code', couponCode);
        }
        // Get current ticket counts and increment
        const { data: currentEvent } = await supabase_1.supabase
            .from('events')
            .select('adult_sold, child_sold, parent_sold, sponsor_name')
            .eq('id', eventId)
            .single();
        console.log('Current event:', currentEvent);
        await supabase_1.supabase
            .from('events')
            .update({
            adult_sold: (currentEvent?.adult_sold || 0) + adultTickets,
            child_sold: (currentEvent?.child_sold || 0) + childTickets,
            parent_sold: (currentEvent?.parent_sold || 0) + parentTickets,
        })
            .eq('id', eventId);
        console.log('Ticket counts updated');
        const code = (0, exports.generateDiscountCode)(currentEvent?.sponsor_name || 'EVENT');
        const issueDate = new Date();
        const expiryDate = new Date(issueDate);
        expiryDate.setDate(expiryDate.getDate() + 30);
        console.log('Generated discount code:', code);
        const { error: codeError } = await supabase_1.supabase
            .from('event_discount_codes')
            .insert({
            booking_id: booking.id,
            user_email: email,
            code,
            issue_date: issueDate.toISOString(),
            expiry_date: expiryDate.toISOString(),
            month_number: 1,
        });
        if (codeError) {
            console.error('Discount code creation error:', codeError);
            throw codeError;
        }
        console.log('Discount code saved to database');
        await (0, email_1.sendEventConfirmationEmail)(email, {
            firstName,
            eventName: currentEvent?.sponsor_name || 'Event',
            adultTickets,
            childTickets,
            totalAmount,
            discountCode: code,
        });
        console.log(`Event booking complete: ${booking.id}, Code sent: ${code}`);
        console.log('=== EVENT WEBHOOK END ===');
    }
    catch (error) {
        console.error('=== EVENT WEBHOOK ERROR ===');
        console.error('Error details:', error);
        throw error;
    }
};
exports.handleEventWebhook = handleEventWebhook;

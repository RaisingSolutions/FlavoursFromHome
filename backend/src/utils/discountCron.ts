import cron from 'node-cron';
import { supabase } from './supabase';
import { sendMonthlyDiscountCode } from './email';
import { generateDiscountCode } from '../controllers/eventController';

export const startDiscountCodeCron = () => {
  // Run daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running monthly discount code generation...');
    
    try {
      const { data: bookings, error } = await supabase
        .from('event_bookings')
        .select('id, user_email, first_name, booking_date, event_id')
        .eq('payment_status', 'paid');

      if (error) throw error;

      for (const booking of bookings || []) {
        const bookingDate = new Date(booking.booking_date);
        const now = new Date();
        const monthsSinceBooking = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

        if (monthsSinceBooking >= 12) continue; // Program ended

        const { data: existingCodes, error: codesError } = await supabase
          .from('event_discount_codes')
          .select('month_number, issue_date')
          .eq('booking_id', booking.id)
          .order('month_number', { ascending: false });

        if (codesError) continue;

        const lastMonthIssued = existingCodes?.[0]?.month_number || 0;
        const nextMonth = lastMonthIssued + 1;

        if (nextMonth > 12) continue;

        const daysSinceLastCode = existingCodes?.[0] 
          ? Math.floor((now.getTime() - new Date(existingCodes[0].issue_date).getTime()) / (1000 * 60 * 60 * 24))
          : 30;

        if (daysSinceLastCode < 30) continue;

        const { data: event } = await supabase
          .from('events')
          .select('sponsor_name')
          .eq('id', booking.event_id)
          .single();

        const code = generateDiscountCode(event?.sponsor_name || 'EVENT');
        const issueDate = new Date();
        const expiryDate = new Date(issueDate);
        expiryDate.setDate(expiryDate.getDate() + 30);

        const { error: insertError } = await supabase
          .from('event_discount_codes')
          .insert({
            booking_id: booking.id,
            user_email: booking.user_email,
            code,
            issue_date: issueDate.toISOString(),
            expiry_date: expiryDate.toISOString(),
            month_number: nextMonth,
          });

        if (insertError) {
          console.error('Failed to create code:', insertError);
          continue;
        }

        await sendMonthlyDiscountCode(booking.user_email, {
          firstName: booking.first_name,
          discountCode: code,
          monthNumber: nextMonth,
        });

        console.log(`Sent month ${nextMonth} code to ${booking.user_email}: ${code}`);
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });

  console.log('Discount code cron job started (runs daily at 9 AM)');
};

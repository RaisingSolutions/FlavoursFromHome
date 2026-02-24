# Event Booking Debugging Guide

## Issue: Data not saving & emails not sending

### Steps to Debug:

1. **Restart Backend with Logging**
   ```bash
   cd backend
   npm run dev
   ```
   Watch console for logs starting with `===`

2. **Test Event Booking**
   - Go to http://localhost:5173?page=events
   - Click "Book Tickets" on Latte Ugadi event
   - Fill form and select tickets
   - Use test card: `4242 4242 4242 4242`
   - Complete payment

3. **Check Backend Console**
   Look for these logs:
   ```
   Webhook received: { sig: ..., hasBody: true }
   Webhook event type: checkout.session.completed
   Session completed. Metadata: { type: 'event_booking', ... }
   Detected event booking, calling handleEventWebhook
   === EVENT WEBHOOK START ===
   Creating event booking: { eventId: 1, email: ..., adultTickets: 1, childTickets: 0 }
   Booking created: 1
   Current event: { adult_sold: 0, child_sold: 0, sponsor_name: 'Latte' }
   Ticket counts updated
   Generated discount code: FFH_LATTA_XXXXX
   Discount code saved to database
   Event booking complete: 1, Code sent: FFH_LATTA_XXXXX
   === EVENT WEBHOOK END ===
   ```

4. **If No Logs Appear**
   - Webhook might not be configured
   - Check Stripe webhook endpoint: http://localhost:5000/api/payment/webhook
   - In Stripe Dashboard, add webhook endpoint

5. **Check Database**
   ```sql
   -- Check if booking was created
   SELECT * FROM event_bookings ORDER BY created_at DESC LIMIT 1;
   
   -- Check if discount code was created
   SELECT * FROM event_discount_codes ORDER BY created_at DESC LIMIT 1;
   
   -- Check if ticket counts updated
   SELECT adult_sold, child_sold FROM events WHERE id = 1;
   ```

6. **Check Email Logs**
   Look for:
   ```
   Event confirmation email sent to: user@example.com
   ```

## Common Issues:

### Issue 1: Webhook Not Receiving Events
**Solution**: Use Stripe CLI for local testing
```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```
Then use the webhook secret it provides in your .env

### Issue 2: Database Insert Fails
**Check**:
- Supabase connection working?
- Tables exist?
- Run: `SELECT * FROM events;` in Supabase

### Issue 3: Email Not Sending
**Check**:
- EMAIL_USER and EMAIL_PASSWORD in .env
- Console shows "Event confirmation email sent to: ..."
- Check spam folder

### Issue 4: Metadata Missing
**Check**:
- Frontend sending correct metadata
- Look for `metadata: { type: 'event_booking', ... }` in logs

## Quick Test Without Stripe:

Test the webhook handler directly:

```bash
curl -X POST http://localhost:5000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "amount_total": 2500,
        "metadata": {
          "type": "event_booking",
          "eventId": "1",
          "firstName": "Test",
          "email": "test@example.com",
          "phoneNumber": "1234567890",
          "adultTickets": "1",
          "childTickets": "0",
          "marketingConsent": "true"
        }
      }
    }
  }'
```

This should trigger the event webhook and you'll see all the logs.

## Expected Flow:

1. User completes Stripe payment
2. Stripe sends webhook to `/api/payment/webhook`
3. Backend detects `type: 'event_booking'` in metadata
4. Calls `handleEventWebhook()`
5. Creates booking in database
6. Updates ticket counts
7. Generates discount code
8. Saves code to database
9. Sends email with code
10. Returns success

## Next Steps:

1. Run backend with `npm run dev`
2. Try booking again
3. Watch console logs
4. Share any error messages you see

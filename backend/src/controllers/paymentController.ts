import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../utils/supabase';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { sendOrderConfirmationEmail } from '../utils/email';
import { handleEventWebhook } from './eventController';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-11-17.clover' });

export const verifyCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // First check regular coupons
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('code, amount, used, expires_at')
      .eq('code', code)
      .single();

    if (!error && coupon) {
      if (coupon.used) {
        return res.status(400).json({ error: 'Coupon already used' });
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Coupon expired' });
      }

      return res.json({ code: coupon.code, amount: coupon.amount, isTestCoupon: false });
    }

    // Check event discount codes
    const { data: eventDiscount, error: eventError } = await supabase
      .from('event_discount_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (!eventError && eventDiscount) {
      if (eventDiscount.redeemed) {
        return res.status(400).json({ error: 'Code already used' });
      }

      if (new Date(eventDiscount.expiry_date) < new Date()) {
        return res.status(400).json({ error: 'Code expired' });
      }

      return res.json({ code: eventDiscount.code, amount: 0, isEventDiscount: true, percentage: 10, maxDiscount: 40 });
    }

    // Check test coupons (100% discount, never expire)
    const { data: testCoupon, error: testError } = await supabase
      .from('test_coupons')
      .select('code, discount_percent')
      .eq('code', code)
      .single();

    if (!testError && testCoupon) {
      return res.json({ 
        code: testCoupon.code, 
        amount: 999999, // Large amount to ensure 100% discount
        isTestCoupon: true 
      });
    }

    return res.status(404).json({ error: 'Invalid coupon code' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to verify coupon' });
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { cart, customerInfo, couponCode } = req.body;

    let discount = 0;
    let isTestCoupon = false;
    let isEventDiscount = false;
    let eventDiscountCode = '';
    
    if (couponCode) {
      // Check regular coupons first
      const { data: coupon } = await supabase
        .from('coupons')
        .select('amount, used')
        .eq('code', couponCode)
        .single();
      
      if (coupon && !coupon.used) {
        discount = coupon.amount;
      } else {
        // Check event discount codes
        const { data: eventCode } = await supabase
          .from('event_discount_codes')
          .select('*')
          .eq('code', couponCode)
          .single();
        
        if (eventCode && !eventCode.redeemed && new Date(eventCode.expiry_date) > new Date()) {
          isEventDiscount = true;
          eventDiscountCode = eventCode.code;
          const subtotal = cart.reduce((sum: number, item: any) => {
            if (item.isFreeRegipallu) return sum;
            return sum + (item.price * item.quantity);
          }, 0);
          discount = Math.min(subtotal * 0.10, 40); // 10% with £40 cap
        } else {
          // Check test coupons
          const { data: testCoupon } = await supabase
            .from('test_coupons')
            .select('discount_percent')
            .eq('code', couponCode)
            .single();
          
          if (testCoupon) {
            isTestCoupon = true;
            const subtotal = cart.reduce((sum: number, item: any) => {
              if (item.isFreeRegipallu) return sum;
              return sum + (item.price * item.quantity);
            }, 0);
            discount = subtotal; // 100% discount
          }
        }
      }
    }

    const subtotal = cart.reduce((sum: number, item: any) => {
      if (item.isFreeRegipallu) return sum;
      return sum + (item.price * item.quantity);
    }, 0);
    const finalTotal = Math.max(0, subtotal - discount);

    const lineItems = [{
      price_data: {
        currency: 'gbp',
        product_data: {
          name: discount > 0 ? `Order Total (${isTestCoupon ? 'TEST 100%' : isEventDiscount ? '10% Event' : discount} discount applied)` : 'Order Total',
        },
        unit_amount: Math.round(finalTotal * 100),
      },
      quantity: 1,
    }];

    const cartData = cart.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      isFreeRegipallu: item.isFreeRegipallu || false
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?canceled=true`,
      metadata: {
        firstName: customerInfo.firstName,
        email: customerInfo.email,
        phoneNumber: customerInfo.phoneNumber,
        address: customerInfo.address,
        orderType: customerInfo.orderType,
        location: customerInfo.location || 'Leeds',
        cartData: JSON.stringify(cartData),
        couponCode: couponCode || '',
        isTestCoupon: isTestCoupon.toString(),
        isEventDiscount: isEventDiscount.toString(),
        eventDiscountCode: eventDiscountCode,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTestCoupons = async (req: Request, res: Response) => {
  try {
    const { data: coupons, error } = await supabase
      .from('test_coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(coupons || []);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch test coupons' });
  }
};

export const createTestCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    // Check if code already exists
    const { data: existing } = await supabase
      .from('test_coupons')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const { data: coupon, error } = await supabase
      .from('test_coupons')
      .insert({
        code: code.toUpperCase(),
        discount_percent: 100,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create test coupon' });
  }
};

export const deleteTestCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('test_coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete test coupon' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  console.log('Webhook received:', { sig, hasBody: !!req.body });

  try {
    let event;
    
    // Skip signature verification in development for test endpoint
    if (process.env.NODE_ENV === 'development' && sig === 'test') {
      event = req.body;
      console.log('Using test mode - skipping signature verification');
    } else {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    }

    console.log('Webhook event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Session completed. Metadata:', session.metadata);
      
      // Check if this is an event booking
      if (session.metadata?.type === 'event_booking') {
        console.log('Detected event booking, calling handleEventWebhook');
        await handleEventWebhook(session);
        console.log('Event webhook completed successfully');
        return res.json({ received: true });
      }
      
      console.log('Processing payment for session:', session.id);
      console.log('Metadata:', session.metadata);
      
      const firstName = session.metadata!.firstName;
      const email = session.metadata!.email;
      const phoneNumber = session.metadata!.phoneNumber;
      const address = session.metadata!.address;
      const location = session.metadata!.location || 'Leeds';
      const cart = JSON.parse(session.metadata!.cartData);
      const couponCode = session.metadata!.couponCode;
      const isTestCoupon = session.metadata!.isTestCoupon === 'true';
      const isEventDiscount = session.metadata!.isEventDiscount === 'true';
      const eventDiscountCode = session.metadata!.eventDiscountCode;

      const totalAmount = session.amount_total! / 100;

      console.log('Creating order for:', firstName, email);

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          first_name: firstName,
          email: email,
          phone_number: phoneNumber,
          address: address,
          location: location,
          payment_method: 'ONLINE',
          payment_status: 'PAID',
          total_amount: totalAmount,
          stripe_session_id: session.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Order creation error:', error);
        throw error;
      }

      console.log('Order created:', order.id);

      const orderItems = cart.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await supabase.from('order_items').insert(orderItems);

      console.log('Order items created');

      // Mark coupon as used (only for regular coupons, not test coupons)
      if (couponCode && !isTestCoupon && !isEventDiscount) {
        await supabase
          .from('coupons')
          .update({ used: true })
          .eq('code', couponCode);
      }

      // Mark event discount code as redeemed
      if (isEventDiscount && eventDiscountCode) {
        await supabase
          .from('event_discount_codes')
          .update({ 
            redeemed: true, 
            redemption_date: new Date().toISOString(),
            order_id: order.id 
          })
          .eq('code', eventDiscountCode);
      }

      // Decrease inventory for each product
      for (const item of cart) {
        const { data: product } = await supabase
          .from('products')
          .select('inventory, name')
          .eq('id', item.id)
          .single();

        if (product) {
          const newInventory = product.inventory - item.quantity;
          await supabase
            .from('products')
            .update({ inventory: newInventory })
            .eq('id', item.id);

          // Send WhatsApp alert if inventory is 10 or less
          if (newInventory <= 10) {
            const adminPhone = process.env.ADMIN_PHONE_NUMBER;
            if (adminPhone) {
              const alertMessage = `⚠️ Low Stock Alert!\n\nProduct: ${product.name}\nCurrent Stock: ${newInventory}\n\nPlease restock soon.`;
              sendWhatsAppMessage(adminPhone, alertMessage);
            }
          }
        }
      }

      // Send WhatsApp notifications
      const itemsList = cart.map((item: any) => `${item.quantity}x ${item.name}`).join('\n');
      const orderType = address === 'Collection' ? '📦 Collection' : '🚚 Delivery';
      const addressLine = address === 'Collection' ? '' : `\nAddress: ${address}`;
      
      const message = `✅ Order #${order.id} Confirmed!\n\nCustomer: ${firstName}\nEmail: ${email}\nPhone: ${phoneNumber}\nType: ${orderType}${addressLine}\n\nItems:\n${itemsList}\n\nTotal: £${totalAmount.toFixed(2)}\nPayment: PAID (Online)\n\nThank you for your order!`;
      
      // Only send WhatsApp to admin
      const adminPhone = process.env.ADMIN_PHONE_NUMBER;
      if (adminPhone) {
        console.log('Sending WhatsApp to admin:', adminPhone);
        sendWhatsAppMessage(adminPhone, message);
      }

      // Send email confirmation
      console.log('Sending email to:', email);
      await sendOrderConfirmationEmail(email, {
        orderId: order.id,
        firstName,
        items: itemsList,
        total: totalAmount,
        address,
        orderType: address === 'Collection' ? 'collection' : 'delivery',
      });
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

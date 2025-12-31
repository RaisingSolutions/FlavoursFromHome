import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../utils/supabase';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { sendOrderConfirmationEmail } from '../utils/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-11-17.clover' });

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { cart, customerInfo } = req.body;

    const lineItems = cart.map((item: any) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const cartData = cart.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
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
        cartData: JSON.stringify(cartData),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  console.log('Webhook received:', { sig, hasBody: !!req.body });

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Webhook event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Processing payment for session:', session.id);
      console.log('Metadata:', session.metadata);
      
      const firstName = session.metadata!.firstName;
      const email = session.metadata!.email;
      const phoneNumber = session.metadata!.phoneNumber;
      const address = session.metadata!.address;
      const cart = JSON.parse(session.metadata!.cartData);

      const totalAmount = session.amount_total! / 100;

      console.log('Creating order for:', firstName, email);

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          first_name: firstName,
          email: email,
          phone_number: phoneNumber,
          address: address,
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

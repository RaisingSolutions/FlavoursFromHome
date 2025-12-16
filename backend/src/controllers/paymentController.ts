import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../utils/supabase';
import { sendWhatsAppMessage } from '../utils/whatsapp';

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?canceled=true`,
      metadata: {
        customerInfo: JSON.stringify(customerInfo),
        cart: JSON.stringify(cart),
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

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const customerInfo = JSON.parse(session.metadata!.customerInfo);
      const cart = JSON.parse(session.metadata!.cart);

      const totalAmount = session.amount_total! / 100;

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          first_name: customerInfo.firstName,
          email: customerInfo.email,
          phone_number: customerInfo.phoneNumber,
          address: customerInfo.address,
          payment_method: 'ONLINE',
          payment_status: 'PAID',
          total_amount: totalAmount,
          stripe_session_id: session.id,
        })
        .select()
        .single();

      if (error) throw error;

      const orderItems = cart.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await supabase.from('order_items').insert(orderItems);

      // Send WhatsApp notifications
      const itemsList = cart.map((item: any) => `${item.quantity}x ${item.name}`).join('\n');
      const orderType = customerInfo.address === 'Collection' ? '📦 Collection' : '🚚 Delivery';
      const addressLine = customerInfo.address === 'Collection' ? '' : `\nAddress: ${customerInfo.address}`;
      
      const message = `✅ Order #${order.id} Confirmed!\n\nCustomer: ${customerInfo.firstName}\nEmail: ${customerInfo.email}\nPhone: ${customerInfo.phoneNumber}\nType: ${orderType}${addressLine}\n\nItems:\n${itemsList}\n\nTotal: £${totalAmount.toFixed(2)}\nPayment: PAID (Online)\n\nThank you for your order!`;
      
      sendWhatsAppMessage(customerInfo.phoneNumber, message);
      
      const adminPhone = process.env.ADMIN_PHONE_NUMBER;
      if (adminPhone) {
        sendWhatsAppMessage(adminPhone, message);
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

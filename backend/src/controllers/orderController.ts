import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-11-17.clover' });

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const location = req.query.location as string; // Filter by location for location admins
    
    let query = supabase
      .from('orders')
      .select(`
        id,
        first_name,
        email,
        phone_number,
        address,
        total_amount,
        discount_code,
        discount_amount,
        payment_method,
        order_date,
        status,
        location,
        driver_id,
        order_items (
          quantity,
          products (
            name
          )
        )
      `)
      .order('order_date', { ascending: false });
    
    // Filter by location if specified (for location admins)
    if (location) {
      query = query.eq('location', location);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    const driverIds = [...new Set(data.map((o: any) => o.driver_id).filter(Boolean))];
    let drivers: any[] = [];
    if (driverIds.length > 0) {
      const { data: driversData } = await supabase
        .from('admin_users')
        .select('id, username')
        .in('id', driverIds);
      drivers = driversData || [];
    }

    const formattedOrders = data.map(order => ({
      ...order,
      driver_username: drivers.find((d: any) => d.id === order.driver_id)?.username,
      order_items: order.order_items.map((item: any) => ({
        quantity: item.quantity,
        product_name: item.products.name
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { first_name, email, phone_number, address, payment_method, total_amount, items, location, discount_code, discount_amount } = req.body;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        first_name,
        email,
        phone_number,
        address,
        payment_method,
        total_amount,
        location, // Leeds, Derby, or Sheffield
        status: 'pending',
        discount_code: discount_code || null,
        discount_amount: discount_amount || 0
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return res.status(400).json({ error: 'Failed to create order' });
    }

    const productIds = items.map((item: any) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds);

    if (productsError) {
      return res.status(400).json({ error: 'Failed to fetch products' });
    }

    const orderItems = items.map((item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: product?.price
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      return res.status(400).json({ error: 'Failed to create order items' });
    }

    const itemsWithNames = items.map((item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      return `${item.quantity}x ${product?.name || 'Product'}`;
    }).join('\n');

    const orderType = address === 'Collection' ? '📦 Collection' : '🚚 Delivery';
    const addressLine = address === 'Collection' ? '' : `\nAddress: ${address}`;
    const discountLine = discount_amount > 0 ? `\nDiscount: -£${discount_amount}` : '';

    const message = `✅ Order #${order.id} Confirmed!\n\nCustomer: ${first_name}\nEmail: ${email}\nPhone: ${phone_number}\nType: ${orderType}${addressLine}\n\nItems:\n${itemsWithNames}${discountLine}\n\nTotal: £${total_amount}\nPayment: ${payment_method}\n\nThank you for your order!`;
    
    sendWhatsAppMessage(phone_number, message);
    
    const adminPhone = process.env.ADMIN_PHONE_NUMBER;
    if (adminPhone) {
      sendWhatsAppMessage(adminPhone, message);
    }

    res.status(201).json(order);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(400).json({ error: 'Failed to create order', details: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*, order_items(quantity, products(name))')
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update order status' });
    }

    if (status === 'delivered') {
      try {
        const { sendFeedbackRequestEmail } = await import('../utils/email');
        await sendFeedbackRequestEmail(data.email, {
          orderId: data.id,
          firstName: data.first_name
        });
        console.log('Feedback email sent to:', data.email);
      } catch (emailError) {
        console.error('Failed to send feedback email:', emailError);
      }
    }

    res.json(data);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(400).json({ error: 'Failed to update order status' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(quantity, product_id, products(name))')
      .eq('id', id)
      .single();

    if (orderError) {
      return res.status(400).json({ error: 'Failed to fetch order' });
    }

    if (order.payment_method === 'ONLINE' && order.stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
      
      if (session.payment_intent) {
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
        });
      }
    }

    for (const item of order.order_items) {
      await supabase.rpc('increment_inventory', {
        product_id: item.product_id,
        amount: item.quantity
      });
    }

    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id);

    const { sendOrderCancellationEmail } = await import('../utils/email');
    await sendOrderCancellationEmail(order.email, {
      orderId: order.id,
      firstName: order.first_name,
      totalAmount: order.total_amount
    });

    res.json({ success: true, message: 'Order cancelled and refund initiated' });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    res.status(400).json({ error: 'Failed to cancel order', details: error.message });
  }
};
import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { sendWhatsAppMessage } from '../utils/whatsapp';

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        first_name,
        email,
        phone_number,
        address,
        total_amount,
        payment_method,
        order_date,
        status,
        driver_id,
        order_items (
          quantity,
          products (
            name
          )
        )
      `)
      .order('order_date', { ascending: false });

    if (error) throw error;

    // Get driver usernames
    const driverIds = [...new Set(data.map((o: any) => o.driver_id).filter(Boolean))];
    let drivers: any[] = [];
    if (driverIds.length > 0) {
      const { data: driversData } = await supabase
        .from('admin_users')
        .select('id, username')
        .in('id', driverIds);
      drivers = driversData || [];
    }

    // Format the data to include product names and driver username
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
    const { first_name, email, phone_number, address, payment_method, total_amount, items } = req.body;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        first_name,
        email,
        phone_number,
        address,
        payment_method,
        total_amount,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }

    // Get product prices and names
    const productIds = items.map((item: any) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds);

    if (productsError) throw productsError;

    // Create order items with prices
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
      throw itemsError;
    }

    // Get product names for WhatsApp message
    const itemsWithNames = items.map((item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      return `${item.quantity}x ${product?.name || 'Product'}`;
    }).join('\n');

    // Send WhatsApp notification to customer and admin
    const message = `✅ Order #${order.id} Confirmed!\n\nItems:\n${itemsWithNames}\n\nTotal: £${total_amount}\nPayment: ${payment_method}\n\nThank you for your order!`;
    
    // Send to customer
    sendWhatsAppMessage(phone_number, message);
    
    // Send to admin
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
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update order status' });
  }
};
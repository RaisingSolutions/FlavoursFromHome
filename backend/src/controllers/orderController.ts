import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

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
        order_items (
          quantity,
          products (
            name
          )
        )
      `)
      .order('order_date', { ascending: false });

    if (error) throw error;

    // Format the data to include product names
    const formattedOrders = data.map(order => ({
      ...order,
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
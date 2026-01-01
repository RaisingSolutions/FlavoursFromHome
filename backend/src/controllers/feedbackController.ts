import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { sendCouponEmail } from '../utils/email';

// Generate unique coupon code
const generateCouponCode = () => {
  return 'FFH' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const getOrderForFeedback = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        first_name,
        email,
        feedback_submitted,
        order_items (
          quantity,
          products (
            id,
            name
          )
        )
      `)
      .eq('id', orderId)
      .eq('status', 'delivered')
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found or not delivered' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { orderId, productRatings, deliveryRating, driverRating, deliveryComments } = req.body;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('feedback_submitted, email, first_name')
      .eq('id', orderId)
      .single();

    if (orderError) {
      return res.status(500).json({ error: 'Failed to fetch order' });
    }

    if (order.feedback_submitted) {
      return res.status(400).json({ 
        error: 'Feedback already submitted',
        message: 'Thanks for submitting your feedback! It\'s really valuable to us. You\'ve already received your voucher for this order.'
      });
    }

    const { error: feedbackError } = await supabase
      .from('feedbacks')
      .insert({
        order_id: orderId,
        product_ratings: productRatings,
        delivery_rating: deliveryRating,
        driver_rating: driverRating,
        delivery_comments: deliveryComments
      });

    if (feedbackError) {
      return res.status(500).json({ error: 'Failed to save feedback' });
    }

    const couponCode = generateCouponCode();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    const { error: couponError } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        order_id: orderId,
        amount: 2.00,
        expires_at: expiresAt.toISOString()
      });

    if (couponError) {
      return res.status(500).json({ error: 'Failed to generate coupon' });
    }

    await supabase
      .from('orders')
      .update({ feedback_submitted: true })
      .eq('id', orderId);

    await sendCouponEmail(order.email, {
      firstName: order.first_name,
      couponCode
    });

    res.json({ 
      success: true, 
      couponCode,
      message: 'Thank you for your feedback! Your £5 voucher has been sent to your email.'
    });
  } catch (error: any) {
    console.error('Submit feedback error:', error);
    res.status(400).json({ error: 'Failed to submit feedback', details: error.message });
  }
};

export const getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .select(`
        id,
        order_id,
        product_ratings,
        delivery_rating,
        driver_rating,
        delivery_comments,
        created_at,
        orders!inner (
          first_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }

    const productIds = new Set<number>();
    data.forEach((fb: any) => {
      Object.keys(fb.product_ratings).forEach(id => productIds.add(parseInt(id)));
    });

    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', Array.from(productIds));

    const formatted = data.map((fb: any) => {
      const ratings: any = {};
      Object.entries(fb.product_ratings).forEach(([id, data]: any) => {
        const product = products?.find(p => p.id === parseInt(id));
        ratings[id] = {
          ...data,
          productName: product?.name || 'Unknown'
        };
      });

      return {
        ...fb,
        customer_name: fb.orders.first_name,
        product_ratings: ratings
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
};

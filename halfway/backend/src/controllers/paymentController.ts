import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { user_id, month, amount, account, comments, paid } = req.body;

    const { data, error } = await supabase
      .from('halfway_payments')
      .insert({
        user_id,
        month,
        amount: parseFloat(amount) || 0,
        account,
        comments,
        paid
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { month } = req.query;

    let query = supabase
      .from('halfway_payments')
      .select(`
        *,
        halfway_users (
          id,
          name
        )
      `);

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

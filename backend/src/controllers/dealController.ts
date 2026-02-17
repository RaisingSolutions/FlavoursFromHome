import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const getAllDeals = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        id,
        deal_price,
        created_at,
        product:products (
          id,
          name,
          price,
          image_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
};

export const createDeal = async (req: Request, res: Response) => {
  try {
    const { product_id, deal_price } = req.body;

    const { data, error } = await supabase
      .from('deals')
      .insert({ product_id, deal_price })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create deal' });
  }
};

export const deleteDeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete deal' });
  }
};

import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const createShift = async (req: Request, res: Response) => {
  try {
    const { user_id, start_time, end_time } = req.body;

    const { data, error } = await supabase
      .from('halfway_shifts')
      .insert({ user_id, start_time, end_time })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shift' });
  }
};

export const getShifts = async (req: Request, res: Response) => {
  try {
    const { period } = req.query; // 'week' or 'month'
    
    const now = new Date();
    let startDate: Date;

    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const { data, error } = await supabase
      .from('halfway_shifts')
      .select(`
        *,
        halfway_users (
          id,
          name,
          username
        )
      `)
      .gte('start_time', startDate.toISOString())
      .order('start_time', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
};

export const getUserShifts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('halfway_shifts')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user shifts' });
  }
};

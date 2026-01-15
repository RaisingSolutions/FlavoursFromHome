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
    const { period, month } = req.query;
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date | undefined;

    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
    } else if (period === 'month' && month) {
      const [year, monthNum] = (month as string).split('-');
      startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    let query = supabase
      .from('halfway_shifts')
      .select(`
        *,
        halfway_users (
          id,
          name,
          username
        )
      `)
      .gte('start_time', startDate.toISOString());
    
    if (endDate) {
      query = query.lte('start_time', endDate.toISOString());
    }
    
    const { data, error } = await query.order('start_time', { ascending: false });

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

export const getMonthlyHours = async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    
    if (!month) {
      return res.status(400).json({ error: 'Month parameter required' });
    }

    const [year, monthNum] = (month as string).split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

    const { data, error } = await supabase
      .from('halfway_shifts')
      .select(`
        user_id,
        start_time,
        end_time,
        halfway_users (
          id,
          name
        )
      `)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    if (error) throw error;

    // Calculate total hours per user
    const userHoursMap: any = {};
    data.forEach((shift: any) => {
      const userId = shift.user_id;
      const hours = (new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / (1000 * 60 * 60);
      
      if (!userHoursMap[userId]) {
        userHoursMap[userId] = {
          user_id: userId,
          name: shift.halfway_users.name,
          total_hours: 0
        };
      }
      userHoursMap[userId].total_hours += hours;
    });

    res.json(Object.values(userHoursMap));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly hours' });
  }
};

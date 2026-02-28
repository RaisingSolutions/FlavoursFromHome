import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const createShift = async (req: Request, res: Response) => {
  try {
    const { user_id, start_time, end_time, is_admin, notes } = req.body;
    const shiftStart = new Date(start_time);
    const now = new Date();
    const hoursSinceShift = (now.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);

    if (!is_admin && hoursSinceShift > 24) {
      return res.status(400).json({ error: 'Shifts must be logged within 24 hours' });
    }

    const weekStart = getWeekStart(shiftStart);

    const { data, error } = await supabase
      .from('halfway_shifts')
      .insert({ user_id, start_time, end_time, week_start: weekStart.toISOString().split('T')[0], notes })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shift' });
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start_time, end_time, is_admin, user_id, notes } = req.body;
    const now = new Date();
    const monday = getWeekStart(now);
    monday.setDate(monday.getDate() + 7);

    const { data: shift } = await supabase.from('halfway_shifts').select('*, week_start, approved').eq('id', id).single();
    
    if (!shift) return res.status(404).json({ error: 'Shift not found' });
    if (shift.approved && !is_admin) return res.status(403).json({ error: 'Cannot edit approved shift' });
    if (!is_admin && shift.user_id !== user_id) return res.status(403).json({ error: 'Cannot edit other user shifts' });
    if (!is_admin && now > monday) return res.status(403).json({ error: 'Edit deadline passed (Monday)' });

    const weekStart = getWeekStart(new Date(start_time));
    const { data, error } = await supabase
      .from('halfway_shifts')
      .update({ start_time, end_time, week_start: weekStart.toISOString().split('T')[0], notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shift' });
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_admin, user_id } = req.body;

    const { data: shift } = await supabase.from('halfway_shifts').select('*').eq('id', id).single();
    if (!shift) return res.status(404).json({ error: 'Shift not found' });
    if (shift.approved && !is_admin) return res.status(403).json({ error: 'Cannot delete approved shift' });
    if (!is_admin && shift.user_id !== user_id) return res.status(403).json({ error: 'Cannot delete other user shifts' });

    const { error } = await supabase.from('halfway_shifts').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Shift deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shift' });
  }
};

export const approveWeek = async (req: Request, res: Response) => {
  try {
    const { week_start, admin_id } = req.body;

    const { error } = await supabase
      .from('halfway_shifts')
      .update({ approved: true, approved_at: new Date().toISOString(), approved_by: admin_id })
      .eq('week_start', week_start)
      .eq('approved', false);

    if (error) throw error;
    res.json({ message: 'Week approved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve week' });
  }
};

export const getShifts = async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    
    if (!month) return res.status(400).json({ error: 'Month required' });

    const [year, monthNum] = (month as string).split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

    const { data, error } = await supabase
      .from('halfway_shifts')
      .select(`*, halfway_users!halfway_shifts_user_id_fkey(id, name)`)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    res.json(data);
  } catch (error) {
    console.error('getShifts error:', error);
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
};

export const getWeeklyShifts = async (req: Request, res: Response) => {
  try {
    const { week_start } = req.query;
    
    const { data, error } = await supabase
      .from('halfway_shifts')
      .select(`*, halfway_users!halfway_shifts_user_id_fkey(id, name)`)
      .eq('week_start', week_start)
      .order('start_time', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
};

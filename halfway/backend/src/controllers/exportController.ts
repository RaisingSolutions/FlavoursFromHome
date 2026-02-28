import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const exportMonthData = async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'Month required' });

    const [year, monthNum] = (month as string).split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

    const { data: shifts, error } = await supabase
      .from('halfway_shifts')
      .select(`*, halfway_users(name)`)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    if (error) throw error;

    const csvRows = ['Date,Day,Employee,Start Time,End Time,Hours,Approved'];
    
    shifts.forEach((shift: any) => {
      const date = new Date(shift.start_time);
      const hours = ((new Date(shift.end_time).getTime() - date.getTime()) / (1000 * 60 * 60)).toFixed(2);
      csvRows.push([
        date.toLocaleDateString('en-GB'),
        date.toLocaleDateString('en-GB', { weekday: 'short' }),
        shift.halfway_users.name,
        date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        new Date(shift.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        hours,
        shift.approved ? 'Yes' : 'No'
      ].join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=timesheet-${month}.csv`);
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
};

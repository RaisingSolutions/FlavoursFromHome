"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserShifts = exports.getShifts = exports.createShift = void 0;
const supabase_1 = require("../utils/supabase");
const createShift = async (req, res) => {
    try {
        const { user_id, start_time, end_time } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('halfway_shifts')
            .insert({ user_id, start_time, end_time })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create shift' });
    }
};
exports.createShift = createShift;
const getShifts = async (req, res) => {
    try {
        const { period } = req.query; // 'week' or 'month'
        const now = new Date();
        let startDate;
        if (period === 'week') {
            startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        }
        else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch shifts' });
    }
};
exports.getShifts = getShifts;
const getUserShifts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('halfway_shifts')
            .select('*')
            .eq('user_id', userId)
            .order('start_time', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user shifts' });
    }
};
exports.getUserShifts = getUserShifts;

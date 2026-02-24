"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeal = exports.createDeal = exports.getAllDeals = void 0;
const supabase_1 = require("../utils/supabase");
const getAllDeals = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch deals' });
    }
};
exports.getAllDeals = getAllDeals;
const createDeal = async (req, res) => {
    try {
        const { product_id, deal_price } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('deals')
            .insert({ product_id, deal_price })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create deal' });
    }
};
exports.createDeal = createDeal;
const deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('deals')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        res.json({ message: 'Deal deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete deal' });
    }
};
exports.deleteDeal = deleteDeal;

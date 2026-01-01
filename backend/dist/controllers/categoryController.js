"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = void 0;
const supabase_1 = require("../utils/supabase");
const getAllCategories = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('categories')
            .select('id, name, description, image_url')
            .order('name');
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
exports.getAllCategories = getAllCategories;
const createCategory = async (req, res) => {
    try {
        const { name, description, image_url } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('categories')
            .insert({
            name,
            description,
            image_url
        })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create category' });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image_url } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('categories')
            .update({
            name,
            description,
            image_url,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update category' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('categories')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete category' });
    }
};
exports.deleteCategory = deleteCategory;

import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, image_url, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image_url } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        description,
        image_url
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;
    
    const { data, error } = await supabase
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

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete category' });
  }
};

export const toggleCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const { error } = await supabase
      .from('categories')
      .update({ is_active })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to toggle category status' });
  }
};
import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        weight,
        image_url,
        category_id,
        categories (
          name
        )
      `)
      .eq('is_active', true);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        weight,
        image_url,
        category_id,
        categories (
          name
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Product not found' });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        weight,
        image_url,
        category_id,
        categories (
          name
        )
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category_id, weight, image_url } = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        category_id,
        weight,
        image_url
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, weight, image_url } = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        category_id,
        weight,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete product' });
  }
};
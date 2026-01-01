import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { sendWhatsAppMessage } from '../utils/whatsapp';

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
        inventory,
        categories (
          name
        )
      `)
      .eq('is_active', true);

    if (error) throw error;

    // Get all feedbacks
    const { data: feedbacks } = await supabase
      .from('feedbacks')
      .select('product_ratings');

    // Calculate average ratings per product
    const ratings: { [key: number]: { total: number; count: number } } = {};
    feedbacks?.forEach((fb: any) => {
      Object.entries(fb.product_ratings).forEach(([productId, data]: any) => {
        const id = parseInt(productId);
        if (!ratings[id]) ratings[id] = { total: 0, count: 0 };
        ratings[id].total += data.rating;
        ratings[id].count += 1;
      });
    });

    // Add average rating to products
    const productsWithRatings = data.map(product => ({
      ...product,
      average_rating: ratings[product.id] 
        ? parseFloat((ratings[product.id].total / ratings[product.id].count).toFixed(1))
        : null,
      rating_count: ratings[product.id]?.count || 0
    }));

    res.json(productsWithRatings);
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
    const { name, description, price, category_id, weight, image_url, inventory } = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        category_id,
        weight,
        image_url,
        inventory: inventory || 0
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
    const { name, description, price, category_id, weight, image_url, inventory } = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        category_id,
        weight,
        image_url,
        inventory,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send WhatsApp alert if inventory is 10 or less
    if (inventory <= 10) {
      const adminPhone = process.env.ADMIN_PHONE_NUMBER;
      if (adminPhone) {
        const message = `⚠️ Low Stock Alert!\n\nProduct: ${name}\nCurrent Stock: ${inventory}\n\nPlease restock soon.`;
        sendWhatsAppMessage(adminPhone, message);
      }
    }

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

export const recordDelivery = async (req: Request, res: Response) => {
  try {
    const { deliveryDate, items } = req.body;

    // Create delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert({ delivery_date: deliveryDate })
      .select()
      .single();

    if (deliveryError) throw deliveryError;

    // Create delivery items and update inventory
    for (const item of items) {
      // Save delivery item
      await supabase
        .from('delivery_items')
        .insert({
          delivery_id: delivery.id,
          product_id: item.product_id,
          quantity: item.quantity
        });

      // Update product inventory
      const { data: product } = await supabase
        .from('products')
        .select('inventory')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ inventory: product.inventory + item.quantity })
          .eq('id', item.product_id);
      }
    }

    res.json({ success: true, message: 'Delivery recorded and inventory updated' });
  } catch (error: any) {
    console.error('Record delivery error:', error);
    res.status(400).json({ error: 'Failed to record delivery', details: error.message });
  }
};

export const getDeliveries = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        id,
        delivery_date,
        delivery_items (
          quantity,
          products (
            name
          )
        )
      `)
      .order('delivery_date', { ascending: false });

    if (error) throw error;

    // Format the data
    const formattedDeliveries = data.map(delivery => ({
      ...delivery,
      items: delivery.delivery_items.map((item: any) => ({
        quantity: item.quantity,
        product_name: item.products.name
      }))
    }));

    res.json(formattedDeliveries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
};
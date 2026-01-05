"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveries = exports.recordDelivery = exports.toggleProductStatus = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductsByCategory = exports.getProductById = exports.getAllProducts = void 0;
const supabase_1 = require("../utils/supabase");
const whatsapp_1 = require("../utils/whatsapp");
const getAllProducts = async (req, res) => {
    try {
        const isAdmin = req.query.admin === 'true';
        let query = supabase_1.supabase
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
        is_active,
        has_limit,
        max_per_order,
        categories (
          name
        )
      `);
        if (!isAdmin) {
            query = query.eq('is_active', true);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        // Get all feedbacks
        const { data: feedbacks } = await supabase_1.supabase
            .from('feedbacks')
            .select('product_ratings');
        // Calculate average ratings per product
        const ratings = {};
        feedbacks?.forEach((fb) => {
            Object.entries(fb.product_ratings).forEach(([productId, data]) => {
                const id = parseInt(productId);
                if (!ratings[id])
                    ratings[id] = { total: 0, count: 0 };
                ratings[id].total += data.rating;
                ratings[id].count += 1;
            });
        });
        // Product 15 uses product 14's rating
        if (ratings[14]) {
            ratings[15] = ratings[14];
        }
        // Add average rating to products
        const productsWithRatings = data.map(product => ({
            ...product,
            average_rating: ratings[product.id]
                ? parseFloat((ratings[product.id].total / ratings[product.id].count).toFixed(1))
                : null,
            rating_count: ratings[product.id]?.count || 0
        }));
        res.json(productsWithRatings);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(404).json({ error: 'Product not found' });
    }
};
exports.getProductById = getProductById;
const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
exports.getProductsByCategory = getProductsByCategory;
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category_id, weight, image_url, inventory, has_limit, max_per_order } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('products')
            .insert({
            name,
            description,
            price,
            category_id,
            weight,
            image_url,
            inventory: inventory || 0,
            has_limit: has_limit || false,
            max_per_order: max_per_order || null
        })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create product' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category_id, weight, image_url, inventory, has_limit, max_per_order } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('products')
            .update({
            name,
            description,
            price,
            category_id,
            weight,
            image_url,
            inventory,
            has_limit,
            max_per_order,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        // Send WhatsApp alert if inventory is 10 or less
        if (inventory <= 10) {
            const adminPhone = process.env.ADMIN_PHONE_NUMBER;
            if (adminPhone) {
                const message = `⚠️ Low Stock Alert!\n\nProduct: ${name}\nCurrent Stock: ${inventory}\n\nPlease restock soon.`;
                (0, whatsapp_1.sendWhatsAppMessage)(adminPhone, message);
            }
        }
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update product' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete product' });
    }
};
exports.deleteProduct = deleteProduct;
const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const { error } = await supabase_1.supabase
            .from('products')
            .update({ is_active })
            .eq('id', id);
        if (error)
            throw error;
        res.json({ success: true });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to toggle product status' });
    }
};
exports.toggleProductStatus = toggleProductStatus;
const recordDelivery = async (req, res) => {
    try {
        const { deliveryDate, items } = req.body;
        // Create delivery record
        const { data: delivery, error: deliveryError } = await supabase_1.supabase
            .from('deliveries')
            .insert({ delivery_date: deliveryDate })
            .select()
            .single();
        if (deliveryError)
            throw deliveryError;
        // Create delivery items and update inventory
        for (const item of items) {
            // Save delivery item
            await supabase_1.supabase
                .from('delivery_items')
                .insert({
                delivery_id: delivery.id,
                product_id: item.product_id,
                quantity: item.quantity
            });
            // Update product inventory
            const { data: product } = await supabase_1.supabase
                .from('products')
                .select('inventory')
                .eq('id', item.product_id)
                .single();
            if (product) {
                await supabase_1.supabase
                    .from('products')
                    .update({ inventory: product.inventory + item.quantity })
                    .eq('id', item.product_id);
            }
        }
        res.json({ success: true, message: 'Delivery recorded and inventory updated' });
    }
    catch (error) {
        console.error('Record delivery error:', error);
        res.status(400).json({ error: 'Failed to record delivery', details: error.message });
    }
};
exports.recordDelivery = recordDelivery;
const getDeliveries = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        // Format the data
        const formattedDeliveries = data.map(delivery => ({
            ...delivery,
            items: delivery.delivery_items.map((item) => ({
                quantity: item.quantity,
                product_name: item.products.name
            }))
        }));
        res.json(formattedDeliveries);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
};
exports.getDeliveries = getDeliveries;

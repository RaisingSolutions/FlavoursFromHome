"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveries = exports.recordDelivery = exports.stockTransfer = exports.toggleProductStatus = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductsByCategory = exports.getProductById = exports.getAllProducts = void 0;
const supabase_1 = require("../utils/supabase");
const whatsapp_1 = require("../utils/whatsapp");
const getAllProducts = async (req, res) => {
    try {
        const isAdmin = req.query.admin === 'true';
        const location = req.query.location;
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
        inventory_leeds,
        inventory_derby,
        inventory_sheffield,
        is_active,
        has_limit,
        max_per_order,
        origin,
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
        // Add average rating and location-specific inventory to products
        const productsWithRatings = data.map(product => {
            let inventory = 0;
            if (location === 'Leeds')
                inventory = product.inventory_leeds;
            else if (location === 'Derby')
                inventory = product.inventory_derby;
            else if (location === 'Sheffield')
                inventory = product.inventory_sheffield;
            return {
                ...product,
                inventory, // Location-specific inventory for customers
                average_rating: ratings[product.id]
                    ? parseFloat((ratings[product.id].total / ratings[product.id].count).toFixed(1))
                    : null,
                rating_count: ratings[product.id]?.count || 0
            };
        });
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
        const location = req.query.location;
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
        inventory_leeds,
        inventory_derby,
        inventory_sheffield,
        has_limit,
        max_per_order,
        origin,
        categories (
          name
        )
      `)
            .eq('category_id', categoryId)
            .eq('is_active', true);
        if (error)
            throw error;
        // Add location-specific inventory
        const productsWithInventory = data.map(product => {
            let inventory = 0;
            if (location === 'Leeds')
                inventory = product.inventory_leeds;
            else if (location === 'Derby')
                inventory = product.inventory_derby;
            else if (location === 'Sheffield')
                inventory = product.inventory_sheffield;
            return {
                ...product,
                inventory
            };
        });
        res.json(productsWithInventory);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
exports.getProductsByCategory = getProductsByCategory;
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category_id, weight, image_url, inventory_leeds, inventory_derby, inventory_sheffield, has_limit, max_per_order, origin } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('products')
            .insert({
            name,
            description,
            price,
            category_id,
            weight,
            image_url,
            inventory_leeds: inventory_leeds || 0,
            inventory_derby: inventory_derby || 0,
            inventory_sheffield: inventory_sheffield || 0,
            has_limit: has_limit || false,
            max_per_order: max_per_order || null,
            origin: origin || null
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
        const { name, description, price, category_id, weight, image_url, inventory_leeds, inventory_derby, inventory_sheffield, has_limit, max_per_order, origin } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('products')
            .update({
            name,
            description,
            price,
            category_id,
            weight,
            image_url,
            inventory_leeds,
            inventory_derby,
            inventory_sheffield,
            has_limit,
            max_per_order,
            origin,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        // Send WhatsApp alert if any location inventory is 10 or less
        const lowStockLocations = [];
        if (inventory_leeds <= 10)
            lowStockLocations.push(`Leeds: ${inventory_leeds}`);
        if (inventory_derby <= 10)
            lowStockLocations.push(`Derby: ${inventory_derby}`);
        if (inventory_sheffield <= 10)
            lowStockLocations.push(`Sheffield: ${inventory_sheffield}`);
        if (lowStockLocations.length > 0) {
            const adminPhone = process.env.ADMIN_PHONE_NUMBER;
            if (adminPhone) {
                const message = `⚠️ Low Stock Alert!\n\nProduct: ${name}\n${lowStockLocations.join('\n')}\n\nPlease restock soon.`;
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
const stockTransfer = async (req, res) => {
    try {
        const { fromLocation, toLocation, items } = req.body;
        // Create delivery record for the transfer
        const { data: delivery, error: deliveryError } = await supabase_1.supabase
            .from('deliveries')
            .insert({
            delivery_date: new Date().toISOString(),
            location: toLocation,
            transfer_from: fromLocation
        })
            .select()
            .single();
        if (deliveryError)
            throw deliveryError;
        for (const item of items) {
            const { data: product } = await supabase_1.supabase
                .from('products')
                .select('inventory_leeds, inventory_derby, inventory_sheffield')
                .eq('id', item.product_id)
                .single();
            if (!product)
                continue;
            // Save delivery item for the transfer
            await supabase_1.supabase
                .from('delivery_items')
                .insert({
                delivery_id: delivery.id,
                product_id: item.product_id,
                quantity: item.quantity
            });
            const updateData = {};
            if (fromLocation === 'Leeds')
                updateData.inventory_leeds = product.inventory_leeds - item.quantity;
            else if (fromLocation === 'Derby')
                updateData.inventory_derby = product.inventory_derby - item.quantity;
            else if (fromLocation === 'Sheffield')
                updateData.inventory_sheffield = product.inventory_sheffield - item.quantity;
            if (toLocation === 'Leeds')
                updateData.inventory_leeds = (updateData.inventory_leeds !== undefined ? updateData.inventory_leeds : product.inventory_leeds) + item.quantity;
            else if (toLocation === 'Derby')
                updateData.inventory_derby = (updateData.inventory_derby !== undefined ? updateData.inventory_derby : product.inventory_derby) + item.quantity;
            else if (toLocation === 'Sheffield')
                updateData.inventory_sheffield = (updateData.inventory_sheffield !== undefined ? updateData.inventory_sheffield : product.inventory_sheffield) + item.quantity;
            await supabase_1.supabase
                .from('products')
                .update(updateData)
                .eq('id', item.product_id);
        }
        res.json({ success: true, message: 'Stock transfer completed' });
    }
    catch (error) {
        console.error('Stock transfer error:', error);
        res.status(400).json({ error: 'Failed to complete stock transfer', details: error.message });
    }
};
exports.stockTransfer = stockTransfer;
const recordDelivery = async (req, res) => {
    try {
        const { deliveryDate, items, location } = req.body;
        // Create delivery record with location
        const { data: delivery, error: deliveryError } = await supabase_1.supabase
            .from('deliveries')
            .insert({
            delivery_date: deliveryDate,
            location: location || 'Leeds'
        })
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
            // Update product inventory for specific location
            const { data: product } = await supabase_1.supabase
                .from('products')
                .select('inventory_leeds, inventory_derby, inventory_sheffield')
                .eq('id', item.product_id)
                .single();
            if (product) {
                const updateData = {};
                if (location === 'Leeds')
                    updateData.inventory_leeds = product.inventory_leeds + item.quantity;
                else if (location === 'Derby')
                    updateData.inventory_derby = product.inventory_derby + item.quantity;
                else if (location === 'Sheffield')
                    updateData.inventory_sheffield = product.inventory_sheffield + item.quantity;
                await supabase_1.supabase
                    .from('products')
                    .update(updateData)
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
        const location = req.query.location;
        let query = supabase_1.supabase
            .from('deliveries')
            .select(`
        id,
        delivery_date,
        location,
        transfer_from,
        delivery_items (
          quantity,
          products (
            name
          )
        )
      `)
            .order('delivery_date', { ascending: false });
        // Filter by location if specified
        if (location) {
            query = query.eq('location', location);
        }
        const { data, error } = await query;
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

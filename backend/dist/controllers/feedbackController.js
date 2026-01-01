"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFeedbacks = exports.submitFeedback = exports.getOrderForFeedback = void 0;
const supabase_1 = require("../utils/supabase");
const email_1 = require("../utils/email");
// Generate unique coupon code
const generateCouponCode = () => {
    return 'FFH' + Math.random().toString(36).substring(2, 10).toUpperCase();
};
const getOrderForFeedback = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { data: order, error } = await supabase_1.supabase
            .from('orders')
            .select(`
        id,
        first_name,
        email,
        feedback_submitted,
        order_items (
          quantity,
          products (
            id,
            name
          )
        )
      `)
            .eq('id', orderId)
            .eq('status', 'delivered')
            .single();
        if (error)
            throw error;
        if (!order) {
            return res.status(404).json({ error: 'Order not found or not delivered' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};
exports.getOrderForFeedback = getOrderForFeedback;
const submitFeedback = async (req, res) => {
    try {
        const { orderId, productRatings, deliveryRating, driverRating, deliveryComments } = req.body;
        // Check if feedback already submitted
        const { data: order, error: orderError } = await supabase_1.supabase
            .from('orders')
            .select('feedback_submitted, email, first_name')
            .eq('id', orderId)
            .single();
        if (orderError)
            throw orderError;
        if (order.feedback_submitted) {
            return res.status(400).json({
                error: 'Feedback already submitted',
                message: 'Thanks for submitting your feedback! It\'s really valuable to us. You\'ve already received your voucher for this order.'
            });
        }
        // Save feedback
        const { error: feedbackError } = await supabase_1.supabase
            .from('feedbacks')
            .insert({
            order_id: orderId,
            product_ratings: productRatings,
            delivery_rating: deliveryRating,
            driver_rating: driverRating,
            delivery_comments: deliveryComments
        });
        if (feedbackError)
            throw feedbackError;
        // Generate coupon
        const couponCode = generateCouponCode();
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 6); // 6 months validity
        const { error: couponError } = await supabase_1.supabase
            .from('coupons')
            .insert({
            code: couponCode,
            order_id: orderId,
            amount: 5.00,
            expires_at: expiresAt.toISOString()
        });
        if (couponError)
            throw couponError;
        // Mark feedback as submitted
        await supabase_1.supabase
            .from('orders')
            .update({ feedback_submitted: true })
            .eq('id', orderId);
        // Send coupon email
        await (0, email_1.sendCouponEmail)(order.email, {
            firstName: order.first_name,
            couponCode
        });
        res.json({
            success: true,
            couponCode,
            message: 'Thank you for your feedback! Your £5 voucher has been sent to your email.'
        });
    }
    catch (error) {
        console.error('Submit feedback error:', error);
        res.status(400).json({ error: 'Failed to submit feedback', details: error.message });
    }
};
exports.submitFeedback = submitFeedback;
const getAllFeedbacks = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('feedbacks')
            .select(`
        id,
        order_id,
        product_ratings,
        delivery_rating,
        driver_rating,
        delivery_comments,
        created_at,
        orders!inner (
          first_name
        )
      `)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        // Get all product IDs from ratings
        const productIds = new Set();
        data.forEach((fb) => {
            Object.keys(fb.product_ratings).forEach(id => productIds.add(parseInt(id)));
        });
        // Fetch product names
        const { data: products } = await supabase_1.supabase
            .from('products')
            .select('id, name')
            .in('id', Array.from(productIds));
        // Format response with product names
        const formatted = data.map((fb) => {
            const ratings = {};
            Object.entries(fb.product_ratings).forEach(([id, data]) => {
                const product = products?.find(p => p.id === parseInt(id));
                ratings[id] = {
                    ...data,
                    productName: product?.name || 'Unknown'
                };
            });
            return {
                ...fb,
                customer_name: fb.orders.first_name,
                product_ratings: ratings
            };
        });
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
};
exports.getAllFeedbacks = getAllFeedbacks;

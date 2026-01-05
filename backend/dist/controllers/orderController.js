"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.updateOrderStatus = exports.createOrder = exports.getAllOrders = void 0;
const supabase_1 = require("../utils/supabase");
const whatsapp_1 = require("../utils/whatsapp");
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' });
const getAllOrders = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('orders')
            .select(`
        id,
        first_name,
        email,
        phone_number,
        address,
        total_amount,
        payment_method,
        order_date,
        status,
        driver_id,
        order_items (
          quantity,
          products (
            name
          )
        )
      `)
            .order('order_date', { ascending: false });
        if (error) {
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }
        const driverIds = [...new Set(data.map((o) => o.driver_id).filter(Boolean))];
        let drivers = [];
        if (driverIds.length > 0) {
            const { data: driversData } = await supabase_1.supabase
                .from('admin_users')
                .select('id, username')
                .in('id', driverIds);
            drivers = driversData || [];
        }
        const formattedOrders = data.map(order => ({
            ...order,
            driver_username: drivers.find((d) => d.id === order.driver_id)?.username,
            order_items: order.order_items.map((item) => ({
                quantity: item.quantity,
                product_name: item.products.name
            }))
        }));
        res.json(formattedOrders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getAllOrders = getAllOrders;
const createOrder = async (req, res) => {
    try {
        const { first_name, email, phone_number, address, payment_method, total_amount, items } = req.body;
        const { data: order, error: orderError } = await supabase_1.supabase
            .from('orders')
            .insert({
            first_name,
            email,
            phone_number,
            address,
            payment_method,
            total_amount,
            status: 'pending'
        })
            .select()
            .single();
        if (orderError) {
            console.error('Order creation error:', orderError);
            return res.status(400).json({ error: 'Failed to create order' });
        }
        const productIds = items.map((item) => item.product_id);
        const { data: products, error: productsError } = await supabase_1.supabase
            .from('products')
            .select('id, name, price')
            .in('id', productIds);
        if (productsError) {
            return res.status(400).json({ error: 'Failed to fetch products' });
        }
        const orderItems = items.map((item) => {
            const product = products?.find(p => p.id === item.product_id);
            return {
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: product?.price
            };
        });
        const { error: itemsError } = await supabase_1.supabase
            .from('order_items')
            .insert(orderItems);
        if (itemsError) {
            console.error('Order items creation error:', itemsError);
            return res.status(400).json({ error: 'Failed to create order items' });
        }
        const itemsWithNames = items.map((item) => {
            const product = products?.find(p => p.id === item.product_id);
            return `${item.quantity}x ${product?.name || 'Product'}`;
        }).join('\n');
        const orderType = address === 'Collection' ? '📦 Collection' : '🚚 Delivery';
        const addressLine = address === 'Collection' ? '' : `\nAddress: ${address}`;
        const message = `✅ Order #${order.id} Confirmed!\n\nCustomer: ${first_name}\nEmail: ${email}\nPhone: ${phone_number}\nType: ${orderType}${addressLine}\n\nItems:\n${itemsWithNames}\n\nTotal: £${total_amount}\nPayment: ${payment_method}\n\nThank you for your order!`;
        (0, whatsapp_1.sendWhatsAppMessage)(phone_number, message);
        const adminPhone = process.env.ADMIN_PHONE_NUMBER;
        if (adminPhone) {
            (0, whatsapp_1.sendWhatsAppMessage)(adminPhone, message);
        }
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(400).json({ error: 'Failed to create order', details: error.message });
    }
};
exports.createOrder = createOrder;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select('*, order_items(quantity, products(name))')
            .single();
        if (error) {
            return res.status(400).json({ error: 'Failed to update order status' });
        }
        if (status === 'delivered') {
            try {
                const { sendFeedbackRequestEmail } = await Promise.resolve().then(() => __importStar(require('../utils/email')));
                await sendFeedbackRequestEmail(data.email, {
                    orderId: data.id,
                    firstName: data.first_name
                });
                console.log('Feedback email sent to:', data.email);
            }
            catch (emailError) {
                console.error('Failed to send feedback email:', emailError);
            }
        }
        res.json(data);
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(400).json({ error: 'Failed to update order status' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: order, error: orderError } = await supabase_1.supabase
            .from('orders')
            .select('*, order_items(quantity, product_id, products(name))')
            .eq('id', id)
            .single();
        if (orderError) {
            return res.status(400).json({ error: 'Failed to fetch order' });
        }
        if (order.payment_method === 'ONLINE' && order.stripe_session_id) {
            const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
            if (session.payment_intent) {
                await stripe.refunds.create({
                    payment_intent: session.payment_intent,
                });
            }
        }
        for (const item of order.order_items) {
            await supabase_1.supabase.rpc('increment_inventory', {
                product_id: item.product_id,
                amount: item.quantity
            });
        }
        await supabase_1.supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', id);
        const { sendOrderCancellationEmail } = await Promise.resolve().then(() => __importStar(require('../utils/email')));
        await sendOrderCancellationEmail(order.email, {
            orderId: order.id,
            firstName: order.first_name,
            totalAmount: order.total_amount
        });
        res.json({ success: true, message: 'Order cancelled and refund initiated' });
    }
    catch (error) {
        console.error('Cancel order error:', error);
        res.status(400).json({ error: 'Failed to cancel order', details: error.message });
    }
};
exports.cancelOrder = cancelOrder;

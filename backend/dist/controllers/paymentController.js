"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.deleteTestCoupon = exports.createTestCoupon = exports.getTestCoupons = exports.createCheckoutSession = exports.verifyCoupon = void 0;
const stripe_1 = __importDefault(require("stripe"));
const supabase_1 = require("../utils/supabase");
const whatsapp_1 = require("../utils/whatsapp");
const email_1 = require("../utils/email");
const eventController_1 = require("./eventController");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' });
const verifyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        // First check regular coupons
        const { data: coupon, error } = await supabase_1.supabase
            .from('coupons')
            .select('code, amount, used, expires_at')
            .eq('code', code)
            .single();
        if (!error && coupon) {
            if (coupon.used) {
                return res.status(400).json({ error: 'Coupon already used' });
            }
            if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
                return res.status(400).json({ error: 'Coupon expired' });
            }
            return res.json({ code: coupon.code, amount: coupon.amount, isTestCoupon: false });
        }
        // Check event discount codes
        const { data: eventDiscount, error: eventError } = await supabase_1.supabase
            .from('event_discount_codes')
            .select('*')
            .eq('code', code)
            .single();
        if (!eventError && eventDiscount) {
            if (eventDiscount.redeemed) {
                return res.status(400).json({ error: 'Code already used' });
            }
            if (new Date(eventDiscount.expiry_date) < new Date()) {
                return res.status(400).json({ error: 'Code expired' });
            }
            return res.json({ code: eventDiscount.code, amount: 0, isEventDiscount: true, percentage: 15, maxDiscount: 40 });
        }
        // Check test coupons (100% discount, never expire)
        const { data: testCoupon, error: testError } = await supabase_1.supabase
            .from('test_coupons')
            .select('code, discount_percent')
            .eq('code', code)
            .single();
        if (!testError && testCoupon) {
            return res.json({
                code: testCoupon.code,
                amount: 999999, // Large amount to ensure 100% discount
                isTestCoupon: true
            });
        }
        return res.status(404).json({ error: 'Invalid coupon code' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to verify coupon' });
    }
};
exports.verifyCoupon = verifyCoupon;
const createCheckoutSession = async (req, res) => {
    try {
        const { cart, customerInfo, couponCode } = req.body;
        let discount = 0;
        let isTestCoupon = false;
        let isEventDiscount = false;
        let eventDiscountCode = '';
        if (couponCode) {
            // Check regular coupons first
            const { data: coupon } = await supabase_1.supabase
                .from('coupons')
                .select('amount, used')
                .eq('code', couponCode)
                .single();
            if (coupon && !coupon.used) {
                discount = coupon.amount;
            }
            else {
                // Check event discount codes
                const { data: eventCode } = await supabase_1.supabase
                    .from('event_discount_codes')
                    .select('*')
                    .eq('code', couponCode)
                    .single();
                if (eventCode && !eventCode.redeemed && new Date(eventCode.expiry_date) > new Date()) {
                    isEventDiscount = true;
                    eventDiscountCode = eventCode.code;
                    const subtotal = cart.reduce((sum, item) => {
                        if (item.isFreeRegipallu)
                            return sum;
                        return sum + (item.price * item.quantity);
                    }, 0);
                    discount = Math.min(subtotal * 0.15, 40); // 15% with £40 cap
                }
                else {
                    // Check test coupons
                    const { data: testCoupon } = await supabase_1.supabase
                        .from('test_coupons')
                        .select('discount_percent')
                        .eq('code', couponCode)
                        .single();
                    if (testCoupon) {
                        isTestCoupon = true;
                        const subtotal = cart.reduce((sum, item) => {
                            if (item.isFreeRegipallu)
                                return sum;
                            return sum + (item.price * item.quantity);
                        }, 0);
                        discount = subtotal; // 100% discount
                    }
                }
            }
        }
        const subtotal = cart.reduce((sum, item) => {
            if (item.isFreeRegipallu)
                return sum;
            return sum + (item.price * item.quantity);
        }, 0);
        const finalTotal = Math.max(0, subtotal - discount);
        const lineItems = [{
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: discount > 0 ? `Order Total (${isTestCoupon ? 'TEST 100%' : isEventDiscount ? '15% Event' : discount} discount applied)` : 'Order Total',
                    },
                    unit_amount: Math.round(finalTotal * 100),
                },
                quantity: 1,
            }];
        const cartData = cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            isFreeRegipallu: item.isFreeRegipallu || false
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?canceled=true`,
            metadata: {
                firstName: customerInfo.firstName,
                email: customerInfo.email,
                phoneNumber: customerInfo.phoneNumber,
                address: customerInfo.address,
                orderType: customerInfo.orderType,
                location: customerInfo.location || 'Leeds',
                cartData: JSON.stringify(cartData),
                couponCode: couponCode || '',
                isTestCoupon: isTestCoupon.toString(),
                isEventDiscount: isEventDiscount.toString(),
                eventDiscountCode: eventDiscountCode,
            },
        });
        res.json({ sessionId: session.id, url: session.url });
    }
    catch (error) {
        console.error('Stripe session error:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const getTestCoupons = async (req, res) => {
    try {
        const { data: coupons, error } = await supabase_1.supabase
            .from('test_coupons')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(coupons || []);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch test coupons' });
    }
};
exports.getTestCoupons = getTestCoupons;
const createTestCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code || !code.trim()) {
            return res.status(400).json({ error: 'Coupon code is required' });
        }
        // Check if code already exists
        const { data: existing } = await supabase_1.supabase
            .from('test_coupons')
            .select('id')
            .eq('code', code.toUpperCase())
            .single();
        if (existing) {
            return res.status(400).json({ error: 'Coupon code already exists' });
        }
        const { data: coupon, error } = await supabase_1.supabase
            .from('test_coupons')
            .insert({
            code: code.toUpperCase(),
            discount_percent: 100,
            created_at: new Date().toISOString()
        })
            .select()
            .single();
        if (error)
            throw error;
        res.json(coupon);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create test coupon' });
    }
};
exports.createTestCoupon = createTestCoupon;
const deleteTestCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('test_coupons')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete test coupon' });
    }
};
exports.deleteTestCoupon = deleteTestCoupon;
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    console.log('Webhook received:', { sig, hasBody: !!req.body });
    try {
        let event;
        // Skip signature verification in development for test endpoint
        if (process.env.NODE_ENV === 'development' && sig === 'test') {
            event = req.body;
            console.log('Using test mode - skipping signature verification');
        }
        else {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        }
        console.log('Webhook event type:', event.type);
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            console.log('Session completed. Metadata:', session.metadata);
            // Check if this is an event booking
            if (session.metadata?.type === 'event_booking') {
                console.log('Detected event booking, calling handleEventWebhook');
                await (0, eventController_1.handleEventWebhook)(session);
                console.log('Event webhook completed successfully');
                return res.json({ received: true });
            }
            console.log('Processing payment for session:', session.id);
            console.log('Metadata:', session.metadata);
            const firstName = session.metadata.firstName;
            const email = session.metadata.email;
            const phoneNumber = session.metadata.phoneNumber;
            const address = session.metadata.address;
            const location = session.metadata.location || 'Leeds';
            const cart = JSON.parse(session.metadata.cartData);
            const couponCode = session.metadata.couponCode;
            const isTestCoupon = session.metadata.isTestCoupon === 'true';
            const isEventDiscount = session.metadata.isEventDiscount === 'true';
            const eventDiscountCode = session.metadata.eventDiscountCode;
            const totalAmount = session.amount_total / 100;
            console.log('Creating order for:', firstName, email);
            const { data: order, error } = await supabase_1.supabase
                .from('orders')
                .insert({
                first_name: firstName,
                email: email,
                phone_number: phoneNumber,
                address: address,
                location: location,
                payment_method: 'ONLINE',
                payment_status: 'PAID',
                total_amount: totalAmount,
                stripe_session_id: session.id,
            })
                .select()
                .single();
            if (error) {
                console.error('Order creation error:', error);
                throw error;
            }
            console.log('Order created:', order.id);
            const orderItems = cart.map((item) => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
            }));
            await supabase_1.supabase.from('order_items').insert(orderItems);
            console.log('Order items created');
            // Mark coupon as used (only for regular coupons, not test coupons)
            if (couponCode && !isTestCoupon && !isEventDiscount) {
                await supabase_1.supabase
                    .from('coupons')
                    .update({ used: true })
                    .eq('code', couponCode);
            }
            // Mark event discount code as redeemed
            if (isEventDiscount && eventDiscountCode) {
                await supabase_1.supabase
                    .from('event_discount_codes')
                    .update({
                    redeemed: true,
                    redemption_date: new Date().toISOString(),
                    order_id: order.id
                })
                    .eq('code', eventDiscountCode);
            }
            // Decrease inventory for each product
            for (const item of cart) {
                const { data: product } = await supabase_1.supabase
                    .from('products')
                    .select('inventory, name')
                    .eq('id', item.id)
                    .single();
                if (product) {
                    const newInventory = product.inventory - item.quantity;
                    await supabase_1.supabase
                        .from('products')
                        .update({ inventory: newInventory })
                        .eq('id', item.id);
                    // Send WhatsApp alert if inventory is 10 or less
                    if (newInventory <= 10) {
                        const adminPhone = process.env.ADMIN_PHONE_NUMBER;
                        if (adminPhone) {
                            const alertMessage = `⚠️ Low Stock Alert!\n\nProduct: ${product.name}\nCurrent Stock: ${newInventory}\n\nPlease restock soon.`;
                            (0, whatsapp_1.sendWhatsAppMessage)(adminPhone, alertMessage);
                        }
                    }
                }
            }
            // Send WhatsApp notifications
            const itemsList = cart.map((item) => `${item.quantity}x ${item.name}`).join('\n');
            const orderType = address === 'Collection' ? '📦 Collection' : '🚚 Delivery';
            const addressLine = address === 'Collection' ? '' : `\nAddress: ${address}`;
            const message = `✅ Order #${order.id} Confirmed!\n\nCustomer: ${firstName}\nEmail: ${email}\nPhone: ${phoneNumber}\nType: ${orderType}${addressLine}\n\nItems:\n${itemsList}\n\nTotal: £${totalAmount.toFixed(2)}\nPayment: PAID (Online)\n\nThank you for your order!`;
            // Only send WhatsApp to admin
            const adminPhone = process.env.ADMIN_PHONE_NUMBER;
            if (adminPhone) {
                console.log('Sending WhatsApp to admin:', adminPhone);
                (0, whatsapp_1.sendWhatsAppMessage)(adminPhone, message);
            }
            // Send email confirmation
            console.log('Sending email to:', email);
            await (0, email_1.sendOrderConfirmationEmail)(email, {
                orderId: order.id,
                firstName,
                items: itemsList,
                total: totalAmount,
                address,
                orderType: address === 'Collection' ? 'collection' : 'delivery',
            });
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};
exports.handleWebhook = handleWebhook;

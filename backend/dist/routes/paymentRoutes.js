"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/payment/create-checkout-session:
 *   post:
 *     summary: Create Stripe checkout session
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               customerEmail:
 *                 type: string
 *               customerName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 */
router.post('/create-checkout-session', paymentController_1.createCheckoutSession);
/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: Stripe webhook handler
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/webhook', paymentController_1.handleWebhook);
/**
 * @swagger
 * /api/payment/verify-coupon:
 *   post:
 *     summary: Verify coupon code
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 discount:
 *                   type: number
 */
router.post('/verify-coupon', paymentController_1.verifyCoupon);
router.get('/test-coupons', paymentController_1.getTestCoupons);
router.post('/test-coupons', paymentController_1.createTestCoupon);
router.delete('/test-coupons/:id', paymentController_1.deleteTestCoupon);
// Test endpoint to complete order without webhook (for local testing)
router.post('/complete-order-test', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            // Manually trigger the webhook logic
            const event = {
                type: 'checkout.session.completed',
                data: { object: session }
            };
            // Call webhook handler without signature verification
            const { handleWebhook } = require('../controllers/paymentController');
            req.body = event;
            req.headers['stripe-signature'] = 'test';
            // Process the order
            await handleWebhook(req, res);
        }
        else {
            res.status(400).json({ error: 'Payment not completed' });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;

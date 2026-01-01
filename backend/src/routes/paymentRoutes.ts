import express from 'express';
import { createCheckoutSession, handleWebhook, verifyCoupon } from '../controllers/paymentController';

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/webhook', handleWebhook);
router.post('/verify-coupon', verifyCoupon);

export default router;

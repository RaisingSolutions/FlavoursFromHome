import express from 'express';
import { savePayment, getPayments } from '../controllers/paymentController';

const router = express.Router();

router.post('/', savePayment);
router.get('/', getPayments);

export default router;

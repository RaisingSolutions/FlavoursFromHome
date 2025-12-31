import { Router } from 'express';
import { getAllOrders, createOrder, updateOrderStatus, cancelOrder } from '../controllers/orderController';

const router = Router();

router.get('/', getAllOrders);
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus);
router.post('/:id/cancel', cancelOrder);

export default router;
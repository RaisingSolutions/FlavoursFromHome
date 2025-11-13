import { Router } from 'express';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController';

const router = Router();

router.get('/', getAllOrders);
router.put('/:id/status', updateOrderStatus);

export default router;
import { Router } from 'express';
import { generateRoutes, assignRoute, getDriverDeliveries, markAsDelivered } from '../controllers/deliveryController';

const router = Router();

router.post('/generate-routes', generateRoutes);
router.post('/assign-route', assignRoute);
router.get('/driver-deliveries', getDriverDeliveries);
router.put('/mark-delivered/:id', markAsDelivered);

export default router;

import { Router } from 'express';
import { generateRoutes, generateRoutesFromOrders, assignRoute, getDriverDeliveries, markAsDelivered } from '../controllers/deliveryController';

const router = Router();

/**
 * @swagger
 * /api/delivery/generate-routes:
 *   post:
 *     summary: Generate delivery routes
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addresses:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Routes generated
 */
router.post('/generate-routes', generateRoutes);

/**
 * @swagger
 * /api/delivery/generate-routes-from-orders:
 *   post:
 *     summary: Generate routes from orders
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Routes generated from orders
 */
router.post('/generate-routes-from-orders', generateRoutesFromOrders);

/**
 * @swagger
 * /api/delivery/assign-route:
 *   post:
 *     summary: Assign route to driver
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driverId:
 *                 type: integer
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Route assigned
 */
router.post('/assign-route', assignRoute);

/**
 * @swagger
 * /api/delivery/driver-deliveries:
 *   get:
 *     summary: Get driver deliveries
 *     tags: [Delivery]
 *     parameters:
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of driver deliveries
 */
router.get('/driver-deliveries', getDriverDeliveries);

/**
 * @swagger
 * /api/delivery/mark-delivered/{id}:
 *   put:
 *     summary: Mark order as delivered
 *     tags: [Delivery]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order marked as delivered
 */
router.put('/mark-delivered/:id', markAsDelivered);

export default router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deliveryController_1 = require("../controllers/deliveryController");
const router = (0, express_1.Router)();
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
router.post('/generate-routes', deliveryController_1.generateRoutes);
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
router.post('/generate-routes-from-orders', deliveryController_1.generateRoutesFromOrders);
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
router.post('/assign-route', deliveryController_1.assignRoute);
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
router.get('/driver-deliveries', deliveryController_1.getDriverDeliveries);
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
router.put('/mark-delivered/:id', deliveryController_1.markAsDelivered);
exports.default = router;

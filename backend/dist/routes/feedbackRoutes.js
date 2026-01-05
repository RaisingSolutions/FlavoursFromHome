"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedbackController_1 = require("../controllers/feedbackController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/feedback/order/{orderId}:
 *   get:
 *     summary: Get order details for feedback
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/order/:orderId', feedbackController_1.getOrderForFeedback);
/**
 * @swagger
 * /api/feedback/submit:
 *   post:
 *     summary: Submit customer feedback
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - overall_rating
 *               - product_ratings
 *             properties:
 *               order_id:
 *                 type: integer
 *               overall_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               product_ratings:
 *                 type: object
 *               comments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback submitted
 */
router.post('/submit', feedbackController_1.submitFeedback);
/**
 * @swagger
 * /api/feedback/all:
 *   get:
 *     summary: Get all feedbacks
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: List of feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 */
router.get('/all', feedbackController_1.getAllFeedbacks);
exports.default = router;

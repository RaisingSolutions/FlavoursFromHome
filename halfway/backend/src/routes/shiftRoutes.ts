import express from 'express';
import { createShift, getShifts, getUserShifts, getMonthlyHours } from '../controllers/shiftController';

const router = express.Router();

/**
 * @swagger
 * /api/shifts:
 *   post:
 *     summary: Create new shift
 *     tags: [Shifts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - shift_date
 *               - start_time
 *               - end_time
 *             properties:
 *               user_id:
 *                 type: integer
 *               shift_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Shift created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shift'
 */
router.post('/', createShift);

/**
 * @swagger
 * /api/shifts:
 *   get:
 *     summary: Get all shifts
 *     tags: [Shifts]
 *     responses:
 *       200:
 *         description: List of shifts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shift'
 */
router.get('/', getShifts);

/**
 * @swagger
 * /api/shifts/user/{userId}:
 *   get:
 *     summary: Get shifts for specific user
 *     tags: [Shifts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User shifts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shift'
 */
router.get('/user/:userId', getUserShifts);

router.get('/monthly-hours', getMonthlyHours);

export default router;

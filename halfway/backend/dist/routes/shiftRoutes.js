"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shiftController_1 = require("../controllers/shiftController");
const router = express_1.default.Router();
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
router.post('/', shiftController_1.createShift);
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
router.get('/', shiftController_1.getShifts);
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
router.get('/user/:userId', shiftController_1.getUserShifts);
exports.default = router;

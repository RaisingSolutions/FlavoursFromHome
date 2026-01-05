import { Router } from 'express';
import { getApiStatus } from '../controllers/testController';

const router = Router();

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Check API health status
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/status', getApiStatus);

export default router;
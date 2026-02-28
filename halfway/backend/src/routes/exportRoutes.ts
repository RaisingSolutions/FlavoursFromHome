import express from 'express';
import { exportMonthData } from '../controllers/exportController';

const router = express.Router();

router.get('/month', exportMonthData);

export default router;

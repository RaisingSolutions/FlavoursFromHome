import express from 'express';
import { createShift, getShifts, getUserShifts } from '../controllers/shiftController';

const router = express.Router();

router.post('/', createShift);
router.get('/', getShifts);
router.get('/user/:userId', getUserShifts);

export default router;

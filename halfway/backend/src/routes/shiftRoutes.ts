import express from 'express';
import { createShift, updateShift, deleteShift, getShifts, getWeeklyShifts, approveWeek } from '../controllers/shiftController';

const router = express.Router();

router.post('/', createShift);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);
router.get('/', getShifts);
router.get('/weekly', getWeeklyShifts);
router.post('/approve', approveWeek);

export default router;

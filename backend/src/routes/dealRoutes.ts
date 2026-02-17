import { Router } from 'express';
import { getAllDeals, createDeal, deleteDeal } from '../controllers/dealController';

const router = Router();

router.get('/', getAllDeals);
router.post('/', createDeal);
router.delete('/:id', deleteDeal);

export default router;

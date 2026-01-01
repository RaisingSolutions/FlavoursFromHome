import { Router } from 'express';
import { getOrderForFeedback, submitFeedback, getAllFeedbacks } from '../controllers/feedbackController';

const router = Router();

router.get('/order/:orderId', getOrderForFeedback);
router.post('/submit', submitFeedback);
router.get('/all', getAllFeedbacks);

export default router;

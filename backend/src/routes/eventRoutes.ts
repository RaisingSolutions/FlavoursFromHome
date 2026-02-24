import express from 'express';
import * as eventController from '../controllers/eventController';

const router = express.Router();

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/:id/book', eventController.createEventBooking);
router.post('/discount/validate', eventController.validateEventDiscount);
router.post('/coupon/validate', eventController.validateEventCoupon);

export default router;

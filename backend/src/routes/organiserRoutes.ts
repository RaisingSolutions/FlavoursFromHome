import express from 'express';
import * as organiserController from '../controllers/organiserController';
import { organiserAuth } from '../middleware/organiserAuth';

const router = express.Router();

router.post('/login', organiserController.organiserLogin);
router.post('/create', organiserController.createOrganiser);
router.get('/dashboard/:eventId', organiserAuth, organiserController.getOrganiserDashboard);
router.get('/export/:eventId', organiserAuth, organiserController.exportAttendees);

export default router;

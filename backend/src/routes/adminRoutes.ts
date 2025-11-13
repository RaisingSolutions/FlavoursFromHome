import { Router } from 'express';
import { loginAdmin, getAllAdmins, createAdmin, updateAdminStatus, deleteAdmin } from '../controllers/adminController';

const router = Router();

router.post('/login', loginAdmin);
router.get('/users', getAllAdmins);
router.post('/users', createAdmin);
router.put('/users/:id/status', updateAdminStatus);
router.delete('/users/:id', deleteAdmin);

export default router;
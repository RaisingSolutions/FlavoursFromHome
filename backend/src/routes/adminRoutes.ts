import { Router } from 'express';
import { loginAdmin, getAllAdmins, createAdmin, updateAdminStatus, deleteAdmin, getDrivers, createDriver } from '../controllers/adminController';
import { requireSuperAdmin } from '../middleware/superAdminMiddleware';

const router = Router();

router.post('/login', loginAdmin);
router.get('/users', getAllAdmins);
router.get('/drivers', getDrivers);
router.post('/users', requireSuperAdmin, createAdmin);
router.post('/drivers', requireSuperAdmin, createDriver);
router.put('/users/:id/status', requireSuperAdmin, updateAdminStatus);
router.delete('/users/:id', requireSuperAdmin, deleteAdmin);

export default router;
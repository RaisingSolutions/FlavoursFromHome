import express from 'express';
import { createUser, getUsers, updatePassword, deleteUser } from '../controllers/userController';

const router = express.Router();

router.post('/', createUser);
router.get('/', getUsers);
router.put('/:id/password', updatePassword);
router.delete('/:id', deleteUser);

export default router;

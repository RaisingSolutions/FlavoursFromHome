import { Router } from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '../controllers/categoryController';

const router = Router();

router.get('/', getAllCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.put('/:id/toggle', toggleCategoryStatus);
router.delete('/:id', deleteCategory);

export default router;
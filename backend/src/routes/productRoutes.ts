import { Router } from 'express';
import { getAllProducts, getProductById, getProductsByCategory } from '../controllers/productController';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);

export default router;
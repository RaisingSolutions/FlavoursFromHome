import { Router } from 'express';
import { getAllProducts, getProductById, getProductsByCategory, createProduct, updateProduct, deleteProduct } from '../controllers/productController';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
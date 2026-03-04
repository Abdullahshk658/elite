import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductsByCategorySlug,
  searchProducts
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/category/:slug', getProductsByCategorySlug);
router.get('/:slug', getProductBySlug);

export default router;

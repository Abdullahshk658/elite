import express from 'express';
import {
  createProduct,
  deleteProduct,
  getAdminOrders,
  getAdminStats,
  updateOrderStatus,
  updateProduct
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.post('/products', upload.array('images', 6), createProduct);
router.put('/products/:id', upload.array('images', 6), updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;

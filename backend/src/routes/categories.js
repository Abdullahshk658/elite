import express from 'express';
import { getCategoryTree } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/tree', getCategoryTree);

export default router;

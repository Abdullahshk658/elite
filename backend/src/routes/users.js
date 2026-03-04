import express from 'express';
import { getDashboard, loginUser, registerUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/dashboard', protect, getDashboard);

export default router;

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/async.js';

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'elitekicks-dev-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = new Error('name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  const exists = await User.findOne({ email });
  if (exists) {
    const error = new Error('User already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    token: createToken(user._id)
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  res.json({
    user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    token: createToken(user._id)
  });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'customer.email': req.user.email })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.json({
    user: req.user,
    recentOrders: orders
  });
});

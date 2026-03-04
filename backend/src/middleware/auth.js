import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './async.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Not authorized');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'elitekicks-dev-secret');
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
  next();
});

export const adminOnly = (req, _res, next) => {
  if (!req.user?.isAdmin) {
    const error = new Error('Admin access required');
    error.statusCode = 403;
    throw error;
  }

  next();
};

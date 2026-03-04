import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { asyncHandler } from '../middleware/async.js';
import { query } from '../config/db.js';
import { serializeOrder } from '../utils/serializers.js';

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

  const normalizedEmail = String(email).toLowerCase().trim();
  const exists = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);
  if (exists.rows.length > 0) {
    const error = new Error('User already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = randomUUID();

  const inserted = await query(
    `
      INSERT INTO users (id, name, email, password, is_admin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, is_admin
    `,
    [userId, name, normalizedEmail, hashedPassword, false]
  );

  const user = inserted.rows[0];

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin },
    token: createToken(user.id)
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '')
    .toLowerCase()
    .trim();

  const result = await query(
    `SELECT id, name, email, password, is_admin
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [normalizedEmail]
  );

  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin },
    token: createToken(user.id)
  });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const result = await query(
    `
      SELECT id, customer, shipping_address, items, total, payment_method, status, whatsapp_notified, created_at, updated_at
      FROM orders
      WHERE customer->>'email' = $1
      ORDER BY created_at DESC
      LIMIT 10
    `,
    [req.user.email]
  );

  const orders = result.rows.map(serializeOrder);

  res.json({
    user: req.user,
    recentOrders: orders
  });
});

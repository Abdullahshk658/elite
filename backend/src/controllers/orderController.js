import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/async.js';
import { buildOrderNotification, buildWaMeLink } from '../utils/whatsapp.js';

const validateStock = async (items) => {
  const products = await Product.find({ _id: { $in: items.map((item) => item.product) } });

  for (const item of items) {
    const product = products.find((p) => String(p._id) === String(item.product));
    if (!product) {
      const error = new Error('A product in cart does not exist');
      error.statusCode = 400;
      throw error;
    }

    const size = product.sizes.find((entry) => entry.size === item.size);
    if (!size || size.stock < item.qty) {
      const error = new Error(`Insufficient stock for ${product.name} size ${item.size}`);
      error.statusCode = 400;
      throw error;
    }
  }
};

const deductStock = async (items) => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product, 'sizes.size': item.size },
      { $inc: { 'sizes.$.stock': -item.qty } }
    );
  }
};

export const createOrder = asyncHandler(async (req, res) => {
  const payload = req.body;

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    const error = new Error('Order items are required');
    error.statusCode = 400;
    throw error;
  }

  await validateStock(payload.items);

  const order = await Order.create(payload);
  await deductStock(payload.items);

  const populatedOrder = await Order.findById(order._id).populate('items.product', 'name').lean();

  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
  const notification = buildOrderNotification(populatedOrder);

  const waLink = adminNumber ? buildWaMeLink(adminNumber, notification) : null;

  res.status(201).json({
    order: populatedOrder,
    whatsappLink: waLink
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name slug').lean();
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  res.json(order);
});

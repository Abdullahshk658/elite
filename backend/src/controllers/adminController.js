import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/async.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
import { slugify } from '../utils/slug.js';

const mapImages = async (files = []) => {
  if (!files.length) return [];

  const uploads = await Promise.all(
    files.map(async (file) => {
      const uploaded = await uploadBufferToCloudinary(file.buffer, 'elitekicks/products');
      return { url: uploaded.secure_url, publicId: uploaded.public_id };
    })
  );

  return uploads;
};

const parseJSON = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

const normalizePayload = (payload) => ({
  ...payload,
  price: payload.price !== undefined ? Number(payload.price) : undefined,
  salePrice:
    payload.salePrice === '' || payload.salePrice === null || payload.salePrice === undefined
      ? null
      : Number(payload.salePrice),
  isFeatured:
    payload.isFeatured === undefined
      ? undefined
      : payload.isFeatured === true || payload.isFeatured === 'true',
  isTrending:
    payload.isTrending === undefined
      ? undefined
      : payload.isTrending === true || payload.isTrending === 'true',
  sizes: parseJSON(payload.sizes, payload.sizes || []),
  images: parseJSON(payload.images, payload.images || []),
  tags: parseJSON(payload.tags, payload.tags || [])
});

export const createProduct = asyncHandler(async (req, res) => {
  const images = await mapImages(req.files || []);
  const payload = normalizePayload(req.body);

  const name = payload.name;
  const slug = payload.slug || slugify(name);

  const product = await Product.create({
    ...payload,
    slug,
    images: images.length ? images : payload.images || []
  });

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const images = await mapImages(req.files || []);
  const updates = normalizePayload(req.body);

  if (updates.name && !updates.slug) {
    updates.slug = slugify(updates.name);
  }

  Object.assign(product, updates);
  if (images.length) {
    product.images = images;
  }

  await product.save();

  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  await product.deleteOne();

  res.json({ message: 'Product removed' });
});

export const getAdminOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).populate('items.product', 'name').lean();
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  order.status = req.body.status || order.status;
  await order.save();
  res.json(order);
});

export const getAdminStats = asyncHandler(async (_req, res) => {
  const [orders, products, lowStockProducts] = await Promise.all([
    Order.find({}).lean(),
    Product.countDocuments(),
    Product.find({ sizes: { $elemMatch: { stock: { $lt: 3 } } } }, 'name sizes').lean()
  ]);

  const revenue = orders
    .filter((order) => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + order.total, 0);

  res.json({
    revenue,
    totalOrders: orders.length,
    totalProducts: products,
    lowStockCount: lowStockProducts.length,
    lowStockProducts
  });
});

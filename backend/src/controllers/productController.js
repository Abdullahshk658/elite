import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { asyncHandler } from '../middleware/async.js';
import { getDescendantCategoryIds } from './helpers.js';

const sortMap = {
  newest: { createdAt: -1 },
  'price-asc': { salePrice: 1, price: 1 },
  'price-desc': { salePrice: -1, price: -1 },
  'best-selling': { isTrending: -1, createdAt: -1 }
};

export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.brand) {
    filter.brand = { $regex: req.query.brand, $options: 'i' };
  }

  if (req.query.qualityTag) {
    filter.qualityTag = req.query.qualityTag;
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  if (req.query.size) {
    filter.sizes = { $elemMatch: { size: req.query.size, stock: { $gt: 0 } } };
  }

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category }).lean();
    if (!category) {
      return res.json({
        page,
        limit,
        total: 0,
        totalPages: 0,
        products: []
      });
    }

    const ids = await getDescendantCategoryIds(category._id);
    filter.category = { $in: ids };
  }

  if (req.query.featured === 'true') {
    filter.isFeatured = true;
  }

  if (req.query.trending === 'true') {
    filter.isTrending = true;
  }

  const sort = sortMap[req.query.sort] || sortMap.newest;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter)
  ]);

  res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    products
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug').lean();

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category?._id
  })
    .limit(8)
    .lean();

  res.json({ product, related });
});

export const getProductsByCategorySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const ids = await getDescendantCategoryIds(category._id);

  const products = await Product.find({ category: { $in: ids } })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ category, count: products.length, products });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();

  if (!q) {
    return res.json([]);
  }

  const products = await Product.find(
    {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    },
    'name slug price salePrice images qualityTag'
  )
    .limit(8)
    .lean();

  res.json(products);
});

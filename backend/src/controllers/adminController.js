import { randomUUID } from 'node:crypto';
import { asyncHandler } from '../middleware/async.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
import { slugify } from '../utils/slug.js';
import { query } from '../config/db.js';
import { serializeOrder, serializeProduct } from '../utils/serializers.js';

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

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const normalizePayload = (payload) => ({
  ...payload,
  price: payload.price !== undefined ? Number(payload.price) : undefined,
  salePrice:
    payload.salePrice === undefined
      ? undefined
      : payload.salePrice === '' || payload.salePrice === null
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
  category:
    typeof payload.category === 'object' && payload.category !== null
      ? payload.category._id || payload.category.id
      : payload.category,
  sizes: ensureArray(parseJSON(payload.sizes, [])),
  images: ensureArray(parseJSON(payload.images, [])),
  tags: ensureArray(parseJSON(payload.tags, [])).map((tag) => String(tag))
});

const fetchProductById = async (id) => {
  const result = await query(
    `
      SELECT
        p.*,
        c.id AS category_ref_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ? serializeProduct(result.rows[0], { withCategory: true }) : null;
};

export const createProduct = asyncHandler(async (req, res) => {
  const images = await mapImages(req.files || []);
  const payload = normalizePayload(req.body);

  const name = payload.name;
  const slug = payload.slug || slugify(name);
  const categoryId = payload.category;

  const inserted = await query(
    `
      INSERT INTO products (
        id,
        name,
        slug,
        sku,
        description,
        price,
        sale_price,
        category_id,
        brand,
        sizes,
        images,
        quality_tag,
        is_featured,
        is_trending,
        tags
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10::jsonb, $11::jsonb, $12, $13, $14, $15::text[]
      )
      RETURNING id
    `,
    [
      randomUUID(),
      payload.name,
      slug,
      payload.sku,
      payload.description,
      payload.price,
      payload.salePrice,
      categoryId,
      payload.brand,
      JSON.stringify(payload.sizes || []),
      JSON.stringify(images.length ? images : payload.images || []),
      payload.qualityTag,
      payload.isFeatured ?? false,
      payload.isTrending ?? false,
      payload.tags || []
    ]
  );

  const product = await fetchProductById(inserted.rows[0].id);

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await fetchProductById(req.params.id);
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

  if (images.length) {
    updates.images = images;
  }

  const updatesMap = [
    ['name', updates.name],
    ['slug', updates.slug],
    ['sku', updates.sku],
    ['description', updates.description],
    ['price', updates.price],
    ['sale_price', updates.salePrice],
    ['category_id', updates.category],
    ['brand', updates.brand],
    ['quality_tag', updates.qualityTag],
    ['is_featured', updates.isFeatured],
    ['is_trending', updates.isTrending]
  ];

  const setClauses = [];
  const params = [];

  updatesMap.forEach(([column, value]) => {
    if (value !== undefined) {
      params.push(value);
      setClauses.push(`${column} = $${params.length}`);
    }
  });

  if (updates.sizes !== undefined) {
    params.push(JSON.stringify(updates.sizes || []));
    setClauses.push(`sizes = $${params.length}::jsonb`);
  }

  if (updates.images !== undefined) {
    params.push(JSON.stringify(updates.images || []));
    setClauses.push(`images = $${params.length}::jsonb`);
  }

  if (updates.tags !== undefined) {
    params.push(updates.tags || []);
    setClauses.push(`tags = $${params.length}::text[]`);
  }

  if (setClauses.length > 0) {
    params.push(req.params.id);
    await query(
      `
        UPDATE products
        SET ${setClauses.join(', ')}, updated_at = NOW()
        WHERE id = $${params.length}
      `,
      params
    );
  }

  const updated = await fetchProductById(req.params.id);
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await fetchProductById(req.params.id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  await query('DELETE FROM products WHERE id = $1', [req.params.id]);

  res.json({ message: 'Product removed' });
});

export const getAdminOrders = asyncHandler(async (req, res) => {
  const result = await query(
    `
      SELECT id, customer, shipping_address, items, total, payment_method, status, whatsapp_notified, created_at, updated_at
      FROM orders
      ORDER BY created_at DESC
    `
  );

  const orders = result.rows.map(serializeOrder);

  const productIds = [
    ...new Set(
      orders.flatMap((order) =>
        (order.items || [])
          .map((item) => item.product)
          .filter((value) => typeof value === 'string' && value.length > 0)
      )
    )
  ];

  let productMap = new Map();
  if (productIds.length) {
    const productResult = await query(
      'SELECT id, name, slug FROM products WHERE id = ANY($1::text[])',
      [productIds]
    );
    productMap = new Map(productResult.rows.map((row) => [row.id, row]));
  }

  const populated = orders.map((order) => ({
    ...order,
    items: (order.items || []).map((item) => {
      const product = productMap.get(item.product);
      return {
        ...item,
        product: product
          ? {
              _id: product.id,
              name: product.name,
              slug: product.slug
            }
          : null
      };
    })
  }));

  res.json(populated);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const nextStatus = req.body.status;
  const allowed = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  if (!allowed.includes(nextStatus)) {
    const error = new Error('Invalid order status');
    error.statusCode = 400;
    throw error;
  }

  const result = await query(
    `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, customer, shipping_address, items, total, payment_method, status, whatsapp_notified, created_at, updated_at
    `,
    [nextStatus, req.params.id]
  );

  if (result.rows.length === 0) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  res.json(serializeOrder(result.rows[0]));
});

export const getAdminStats = asyncHandler(async (_req, res) => {
  const [ordersResult, productsResult, lowStockResult] = await Promise.all([
    query('SELECT total, status FROM orders'),
    query('SELECT COUNT(*)::int AS count FROM products'),
    query(
      `
        SELECT id, name, sizes
        FROM products
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(sizes) AS size_entry
          WHERE COALESCE((size_entry->>'stock')::int, 0) < 3
        )
      `
    )
  ]);

  const orders = ordersResult.rows;
  const revenue = orders
    .filter((order) => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + Number(order.total), 0);

  const lowStockProducts = lowStockResult.rows.map((row) => ({
    _id: row.id,
    name: row.name,
    sizes: row.sizes || []
  }));

  res.json({
    revenue,
    totalOrders: orders.length,
    totalProducts: productsResult.rows[0]?.count || 0,
    lowStockCount: lowStockProducts.length,
    lowStockProducts
  });
});

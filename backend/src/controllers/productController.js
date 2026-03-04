import { asyncHandler } from '../middleware/async.js';
import { getDescendantCategoryIds } from './helpers.js';
import { query } from '../config/db.js';
import { serializeCategory, serializeProduct } from '../utils/serializers.js';

const sortMap = {
  newest: 'p.created_at DESC',
  'price-asc': 'COALESCE(p.sale_price, p.price) ASC, p.price ASC',
  'price-desc': 'COALESCE(p.sale_price, p.price) DESC, p.price DESC',
  'best-selling': 'p.is_trending DESC, p.created_at DESC'
};

export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const skip = (page - 1) * limit;
  const where = [];
  const params = [];

  if (req.query.brand) {
    params.push(`%${String(req.query.brand)}%`);
    where.push(`p.brand ILIKE $${params.length}`);
  }

  if (req.query.qualityTag) {
    params.push(String(req.query.qualityTag));
    where.push(`p.quality_tag = $${params.length}`);
  }

  if (req.query.minPrice) {
    params.push(Number(req.query.minPrice));
    where.push(`p.price >= $${params.length}`);
  }

  if (req.query.maxPrice) {
    params.push(Number(req.query.maxPrice));
    where.push(`p.price <= $${params.length}`);
  }

  if (req.query.size) {
    params.push(String(req.query.size));
    where.push(
      `EXISTS (
        SELECT 1
        FROM jsonb_array_elements(p.sizes) AS size_entry
        WHERE size_entry->>'size' = $${params.length}
          AND COALESCE((size_entry->>'stock')::int, 0) > 0
      )`
    );
  }

  if (req.query.search) {
    params.push(`%${String(req.query.search)}%`);
    where.push(
      `(p.name ILIKE $${params.length}
        OR p.brand ILIKE $${params.length}
        OR p.description ILIKE $${params.length}
        OR EXISTS (
          SELECT 1
          FROM unnest(p.tags) AS tag
          WHERE tag ILIKE $${params.length}
        ))`
    );
  }

  if (req.query.category) {
    const categoryResult = await query('SELECT id FROM categories WHERE slug = $1 LIMIT 1', [
      String(req.query.category)
    ]);

    if (categoryResult.rows.length === 0) {
      return res.json({
        page,
        limit,
        total: 0,
        totalPages: 0,
        products: []
      });
    }

    const ids = await getDescendantCategoryIds(categoryResult.rows[0].id);
    params.push(ids);
    where.push(`p.category_id = ANY($${params.length}::text[])`);
  }

  if (req.query.featured === 'true') {
    where.push('p.is_featured = TRUE');
  }

  if (req.query.trending === 'true') {
    where.push('p.is_trending = TRUE');
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sort = sortMap[req.query.sort] || sortMap.newest;

  const listParams = [...params, limit, skip];
  const listQuery = `
    SELECT
      p.*,
      c.id AS category_ref_id,
      c.name AS category_name,
      c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ${whereSql}
    ORDER BY ${sort}
    LIMIT $${listParams.length - 1}
    OFFSET $${listParams.length}
  `;

  const countQuery = `SELECT COUNT(*)::int AS total FROM products p ${whereSql}`;

  const [productResult, totalResult] = await Promise.all([query(listQuery, listParams), query(countQuery, params)]);

  const products = productResult.rows.map((row) => serializeProduct(row, { withCategory: true }));
  const total = totalResult.rows[0]?.total || 0;

  res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    products
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const productResult = await query(
    `
      SELECT
        p.*,
        c.id AS category_ref_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug = $1
      LIMIT 1
    `,
    [req.params.slug]
  );

  const row = productResult.rows[0];
  const product = row ? serializeProduct(row, { withCategory: true }) : null;

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const relatedResult = await query(
    `
      SELECT
        p.*,
        c.id AS category_ref_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id <> $1 AND p.category_id = $2
      ORDER BY p.created_at DESC
      LIMIT 8
    `,
    [product._id, product.category?._id || null]
  );

  const related = relatedResult.rows.map((entry) => serializeProduct(entry, { withCategory: true }));

  res.json({ product, related });
});

export const getProductsByCategorySlug = asyncHandler(async (req, res) => {
  const categoryResult = await query(
    'SELECT id, name, slug, parent_id, image, level, created_at, updated_at FROM categories WHERE slug = $1 LIMIT 1',
    [req.params.slug]
  );

  const categoryRow = categoryResult.rows[0];
  if (!categoryRow) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const ids = await getDescendantCategoryIds(categoryRow.id);
  const productsResult = await query(
    `
      SELECT
        p.*,
        c.id AS category_ref_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.category_id = ANY($1::text[])
      ORDER BY p.created_at DESC
    `,
    [ids]
  );

  const products = productsResult.rows.map((row) => serializeProduct(row, { withCategory: true }));
  const category = serializeCategory(categoryRow);

  res.json({ category, count: products.length, products });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();

  if (!q) {
    return res.json([]);
  }

  const searchValue = `%${q}%`;
  const result = await query(
    `
      SELECT id, name, slug, price, sale_price, images, quality_tag, created_at
      FROM products
      WHERE name ILIKE $1
        OR brand ILIKE $1
        OR EXISTS (
          SELECT 1
          FROM unnest(tags) AS tag
          WHERE tag ILIKE $1
        )
      ORDER BY is_trending DESC, created_at DESC
      LIMIT 8
    `,
    [searchValue]
  );

  const products = result.rows.map((row) => ({
    _id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    salePrice: row.sale_price === null ? null : Number(row.sale_price),
    images: row.images || [],
    qualityTag: row.quality_tag
  }));

  res.json(products);
});

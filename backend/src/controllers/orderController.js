import { randomUUID } from 'node:crypto';
import { asyncHandler } from '../middleware/async.js';
import { buildOrderNotification, buildWaMeLink } from '../utils/whatsapp.js';
import { query, withTransaction } from '../config/db.js';
import { serializeOrder } from '../utils/serializers.js';

const getProductsMap = async (dbClient, ids) => {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return new Map();

  const result = await dbClient.query(
    `SELECT id, name, slug, sizes, price, sale_price
     FROM products
     WHERE id = ANY($1::text[])`,
    [uniqueIds]
  );

  return new Map(result.rows.map((row) => [row.id, row]));
};

const validateAndApplyStock = (productsMap, items) => {
  for (const item of items) {
    const product = productsMap.get(item.product);
    if (!product) {
      const error = new Error('A product in cart does not exist');
      error.statusCode = 400;
      throw error;
    }

    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const size = sizes.find((entry) => entry.size === item.size);
    if (!size || size.stock < item.qty) {
      const error = new Error(`Insufficient stock for ${product.name} size ${item.size}`);
      error.statusCode = 400;
      throw error;
    }

    size.stock -= item.qty;
  }
};

const populateOrderItems = async (dbClient, order) => {
  const ids = order.items.map((item) => item.product).filter(Boolean);
  if (!ids.length) {
    return order;
  }

  const productsMap = await getProductsMap(dbClient, ids);
  const enrichedItems = order.items.map((item) => {
    const product = productsMap.get(item.product);
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
  });

  return {
    ...order,
    items: enrichedItems
  };
};

export const createOrder = asyncHandler(async (req, res) => {
  const payload = req.body;

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    const error = new Error('Order items are required');
    error.statusCode = 400;
    throw error;
  }

  const created = await withTransaction(async (client) => {
    const productIds = payload.items.map((item) => item.product);

    const lockResult = await client.query(
      `SELECT id, name, slug, sizes, price, sale_price
       FROM products
       WHERE id = ANY($1::text[])
       FOR UPDATE`,
      [productIds]
    );

    const productsMap = new Map(lockResult.rows.map((row) => [row.id, row]));
    validateAndApplyStock(productsMap, payload.items);

    for (const product of productsMap.values()) {
      await client.query(
        `UPDATE products
         SET sizes = $1::jsonb, updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(product.sizes || []), product.id]
      );
    }

    const orderId = randomUUID();
    const insertedOrder = await client.query(
      `
        INSERT INTO orders (
          id,
          customer,
          shipping_address,
          items,
          total,
          payment_method,
          status,
          whatsapp_notified
        )
        VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5, $6, $7, $8)
        RETURNING id, customer, shipping_address, items, total, payment_method, status, whatsapp_notified, created_at, updated_at
      `,
      [
        orderId,
        JSON.stringify(payload.customer),
        JSON.stringify(payload.shippingAddress),
        JSON.stringify(payload.items),
        payload.total,
        payload.paymentMethod,
        'Pending',
        false
      ]
    );

    const order = serializeOrder(insertedOrder.rows[0]);
    return populateOrderItems(client, order);
  });

  const populatedOrder = created;

  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
  const notification = buildOrderNotification(populatedOrder);

  const waLink = adminNumber ? buildWaMeLink(adminNumber, notification) : null;

  res.status(201).json({
    order: populatedOrder,
    whatsappLink: waLink
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const result = await query(
    `
      SELECT id, customer, shipping_address, items, total, payment_method, status, whatsapp_notified, created_at, updated_at
      FROM orders
      WHERE id = $1
      LIMIT 1
    `,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  const order = serializeOrder(result.rows[0]);
  const populated = await populateOrderItems({ query }, order);

  res.json(populated);
});

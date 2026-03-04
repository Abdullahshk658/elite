import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, closeDB, query } from '../config/db.js';
import { seedCategories, seedProducts, seedUsers } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '../../../.env');
const backendEnvPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: backendEnvPath, override: true });

const clearData = async () => {
  await query('DELETE FROM orders');
  await query('DELETE FROM products');
  await query('DELETE FROM categories');
  await query('DELETE FROM users');
};

const insertCategories = async () => {
  const slugToCategoryId = new Map();
  const created = [];

  for (const entry of seedCategories) {
    const categoryId = randomUUID();
    const parentId = entry.parentSlug ? slugToCategoryId.get(entry.parentSlug) || null : null;

    await query(
      `
        INSERT INTO categories (id, name, slug, parent_id, image, level)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [categoryId, entry.name, entry.slug, parentId, entry.image || '', entry.level]
    );

    slugToCategoryId.set(entry.slug, categoryId);
    created.push({ id: categoryId, slug: entry.slug });
  }

  return { created, slugToCategoryId };
};

const insertProducts = async (slugToCategoryId) => {
  const created = [];

  for (const entry of seedProducts) {
    const categoryId = slugToCategoryId.get(entry.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category slug: ${entry.categorySlug}`);
    }

    const productId = randomUUID();
    await query(
      `
        INSERT INTO products (
          id, name, slug, sku, description, price, sale_price, category_id, brand,
          sizes, images, quality_tag, is_featured, is_trending, tags
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10::jsonb, $11::jsonb, $12, $13, $14, $15::text[]
        )
      `,
      [
        productId,
        entry.name,
        entry.slug,
        entry.sku,
        entry.description,
        entry.price,
        entry.salePrice,
        categoryId,
        entry.brand,
        JSON.stringify(entry.sizes || []),
        JSON.stringify(entry.images || []),
        entry.qualityTag,
        Boolean(entry.isFeatured),
        Boolean(entry.isTrending),
        entry.tags || []
      ]
    );

    created.push({
      id: productId,
      name: entry.name,
      price: entry.price,
      salePrice: entry.salePrice
    });
  }

  return created;
};

const insertUsers = async () => {
  const created = [];

  for (const entry of seedUsers) {
    const userId = randomUUID();
    const hashedPassword = await bcrypt.hash(entry.password, 10);
    await query(
      `
        INSERT INTO users (id, name, email, password, is_admin)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [userId, entry.name, entry.email.toLowerCase(), hashedPassword, Boolean(entry.isAdmin)]
    );

    created.push({
      id: userId,
      name: entry.name,
      email: entry.email.toLowerCase(),
      isAdmin: Boolean(entry.isAdmin)
    });
  }

  return created;
};

const insertSampleOrder = async (products, users) => {
  const customer = users.find((user) => !user.isAdmin);
  if (!customer || products.length < 2) {
    return null;
  }

  const orderItems = [
    {
      product: products[0].id,
      size: '42',
      qty: 1,
      price: products[0].salePrice || products[0].price
    },
    {
      product: products[1].id,
      size: '43',
      qty: 1,
      price: products[1].salePrice || products[1].price
    }
  ];

  const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0) + 250;
  const orderId = randomUUID();

  await query(
    `
      INSERT INTO orders (
        id, customer, shipping_address, items, total,
        payment_method, status, whatsapp_notified
      )
      VALUES (
        $1, $2::jsonb, $3::jsonb, $4::jsonb, $5,
        $6, $7, $8
      )
    `,
    [
      orderId,
      JSON.stringify({
        name: customer.name,
        email: customer.email,
        phone: '+92 300 1234567'
      }),
      JSON.stringify({
        street: 'House 22, Block 5',
        city: 'Karachi',
        province: 'Sindh',
        postalCode: '75400'
      }),
      JSON.stringify(orderItems),
      total,
      'COD',
      'Pending',
      false
    ]
  );

  return orderId;
};

const run = async () => {
  const mode = process.argv[2] || 'seed';
  await connectDB();

  if (mode === '--clear') {
    await clearData();
    console.log('Database cleared: categories, products, users, orders');
    return;
  }

  await clearData();
  const { created: categories, slugToCategoryId } = await insertCategories();
  const products = await insertProducts(slugToCategoryId);
  const users = await insertUsers();
  const order = await insertSampleOrder(products, users);

  console.log('Seed completed successfully');
  console.log(`Categories: ${categories.length}`);
  console.log(`Products: ${products.length}`);
  console.log(`Users: ${users.length}`);
  console.log(`Sample order: ${order ? 'created' : 'skipped'}`);
  console.log('Admin login: admin@elitekicks.pk / Admin@123456');
  console.log('Customer login: customer@elitekicks.pk / Customer@123');
};

run()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDB();
  });

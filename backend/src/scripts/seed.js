import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { seedCategories, seedProducts, seedUsers } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '../../../.env');
const backendEnvPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: backendEnvPath, override: false });

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/elitekicks';

const connect = async () => {
  await mongoose.connect(mongoUri);
};

const clearData = async () => {
  await Promise.all([
    Order.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({})
  ]);
};

const insertCategories = async () => {
  const slugToCategoryId = new Map();
  const created = [];

  for (const entry of seedCategories) {
    const parentId = entry.parentSlug ? slugToCategoryId.get(entry.parentSlug) || null : null;

    const category = await Category.create({
      name: entry.name,
      slug: entry.slug,
      parent: parentId,
      image: entry.image,
      level: entry.level
    });

    slugToCategoryId.set(entry.slug, category._id);
    created.push(category);
  }

  return { created, slugToCategoryId };
};

const insertProducts = async (slugToCategoryId) => {
  const docs = seedProducts.map((entry) => {
    const category = slugToCategoryId.get(entry.categorySlug);
    if (!category) {
      throw new Error(`Unknown category slug: ${entry.categorySlug}`);
    }

    return {
      name: entry.name,
      slug: entry.slug,
      sku: entry.sku,
      description: entry.description,
      price: entry.price,
      salePrice: entry.salePrice,
      category,
      brand: entry.brand,
      sizes: entry.sizes,
      images: entry.images,
      qualityTag: entry.qualityTag,
      isFeatured: entry.isFeatured,
      isTrending: entry.isTrending,
      tags: entry.tags
    };
  });

  const created = await Product.insertMany(docs);
  return created;
};

const insertUsers = async () => {
  const docs = await Promise.all(
    seedUsers.map(async (entry) => ({
      name: entry.name,
      email: entry.email,
      password: await bcrypt.hash(entry.password, 10),
      isAdmin: entry.isAdmin
    }))
  );

  return User.insertMany(docs);
};

const insertSampleOrder = async (products, users) => {
  const customer = users.find((user) => !user.isAdmin);
  if (!customer || products.length < 2) {
    return null;
  }

  const orderItems = [
    {
      product: products[0]._id,
      size: '42',
      qty: 1,
      price: products[0].salePrice || products[0].price
    },
    {
      product: products[1]._id,
      size: '43',
      qty: 1,
      price: products[1].salePrice || products[1].price
    }
  ];

  const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0) + 250;

  return Order.create({
    customer: {
      name: customer.name,
      email: customer.email,
      phone: '+92 300 1234567'
    },
    shippingAddress: {
      street: 'House 22, Block 5',
      city: 'Karachi',
      province: 'Sindh',
      postalCode: '75400'
    },
    items: orderItems,
    total,
    paymentMethod: 'COD',
    status: 'Pending',
    whatsappNotified: false
  });
};

const run = async () => {
  const mode = process.argv[2] || 'seed';

  await connect();

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
    await mongoose.disconnect();
  });

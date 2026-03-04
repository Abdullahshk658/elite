import { Pool } from 'pg';

const cleanEnvValue = (value) => (typeof value === 'string' ? value.trim().replace(/^['"]|['"]$/g, '') : value);

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildPoolTuningConfig = () => ({
  connectionTimeoutMillis: toPositiveInt(process.env.DB_CONNECTION_TIMEOUT_MS, 5000),
  idleTimeoutMillis: toPositiveInt(process.env.DB_IDLE_TIMEOUT_MS, 30000),
  query_timeout: toPositiveInt(process.env.DB_QUERY_TIMEOUT_MS, 10000),
  max: toPositiveInt(process.env.DB_POOL_MAX, process.env.VERCEL ? 2 : 10)
});

const buildPoolConfig = () => {
  const databaseUrl = cleanEnvValue(process.env.DATABASE_URL);
  const host = cleanEnvValue(process.env.DB_HOST);
  const useSsl =
    process.env.DB_SSL === 'true' ||
    Boolean(
      (databaseUrl && !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1')) ||
        (host && !host.includes('localhost') && !host.includes('127.0.0.1'))
    );

  if (databaseUrl) {
    return {
      connectionString: databaseUrl,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      ...buildPoolTuningConfig()
    };
  }

  return {
    host: host || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    database: cleanEnvValue(process.env.DB_NAME) || 'postgres',
    user: cleanEnvValue(process.env.DB_USER) || 'postgres',
    password: cleanEnvValue(process.env.DB_PASSWORD) || '',
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    ...buildPoolTuningConfig()
  };
};

const getDbHostForLogs = () => {
  const databaseUrl = cleanEnvValue(process.env.DATABASE_URL);
  if (databaseUrl) {
    try {
      return new URL(databaseUrl).hostname;
    } catch {
      return databaseUrl;
    }
  }
  return cleanEnvValue(process.env.DB_HOST) || 'unknown-host';
};

const schemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  image TEXT NOT NULL DEFAULT '',
  level INTEGER NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  sale_price NUMERIC(12, 2) CHECK (sale_price >= 0),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand TEXT NOT NULL,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  quality_tag TEXT NOT NULL CHECK (quality_tag IN ('1:1', 'Dot Perfect', 'High-End', 'Premium Plus Batch')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'Bank Transfer')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
  whatsapp_notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
`;

let poolInstance;

const getPool = () => {
  if (!poolInstance) {
    poolInstance = new Pool(buildPoolConfig());
  }

  return poolInstance;
};

export const query = (text, params = []) => getPool().query(text, params);

export const withTransaction = async (work) => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const connectDB = async () => {
  let client;

  try {
    client = await getPool().connect();
    await client.query('SELECT 1');
    await client.query(schemaSql);
    console.log('PostgreSQL connected');
  } catch (error) {
    if (error?.code === 'ENOTFOUND') {
      console.error(`Database host could not be resolved: ${getDbHostForLogs()}`);
    }
    throw error;
  } finally {
    client?.release();
  }
};

export const closeDB = async () => {
  if (!poolInstance) return;
  await poolInstance.end();
  poolInstance = undefined;
};

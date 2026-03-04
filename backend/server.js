import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js';
import productRoutes from './src/routes/products.js';
import orderRoutes from './src/routes/orders.js';
import userRoutes from './src/routes/users.js';
import adminRoutes from './src/routes/admin.js';
import categoryRoutes from './src/routes/categories.js';
import { notFound, errorHandler } from './src/middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '../.env');
const backendEnvPath = path.resolve(__dirname, './.env');

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: backendEnvPath, override: true });

const app = express();
const dbReadyPromise = connectDB().catch((error) => {
  console.error('Failed to connect database', error);
  throw error;
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(async (_req, _res, next) => {
  try {
    await dbReadyPromise;
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'EliteKicks API' });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;

if (!process.env.VERCEL) {
  dbReadyPromise.then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }).catch(() => {
    process.exit(1);
  });
}

export default app;

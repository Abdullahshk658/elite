import Category from '../models/Category.js';
import { asyncHandler } from '../middleware/async.js';
import { buildCategoryTree } from './helpers.js';

export const getCategoryTree = asyncHandler(async (_req, res) => {
  const categories = await Category.find({}).sort({ level: 1, name: 1 }).lean();
  const tree = buildCategoryTree(categories);
  res.json(tree);
});

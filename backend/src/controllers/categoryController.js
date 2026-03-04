import { asyncHandler } from '../middleware/async.js';
import { buildCategoryTree } from './helpers.js';
import { query } from '../config/db.js';

export const getCategoryTree = asyncHandler(async (_req, res) => {
  const { rows } = await query(
    'SELECT id, name, slug, parent_id, image, level, created_at, updated_at FROM categories ORDER BY level ASC, name ASC'
  );
  const tree = buildCategoryTree(rows);
  res.json(tree);
});

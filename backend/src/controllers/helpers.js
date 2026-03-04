import { query } from '../config/db.js';
import { serializeCategory } from '../utils/serializers.js';

export const getDescendantCategoryIds = async (rootId) => {
  const { rows } = await query('SELECT id, parent_id FROM categories');
  const parentToChildren = new Map();

  rows.forEach((category) => {
    const parentKey = category.parent_id ? String(category.parent_id) : 'root';
    if (!parentToChildren.has(parentKey)) {
      parentToChildren.set(parentKey, []);
    }
    parentToChildren.get(parentKey).push(String(category.id));
  });

  const stack = [String(rootId)];
  const visited = new Set(stack);

  while (stack.length > 0) {
    const current = stack.pop();
    const children = parentToChildren.get(current) || [];

    children.forEach((childId) => {
      if (!visited.has(childId)) {
        visited.add(childId);
        stack.push(childId);
      }
    });
  }

  return Array.from(visited);
};

export const buildCategoryTree = (categories) => {
  const map = new Map();
  const roots = [];

  categories.forEach((row) => {
    const category = serializeCategory(row);
    map.set(String(category._id), {
      ...category,
      children: []
    });
  });

  categories.forEach((row) => {
    const category = serializeCategory(row);
    const node = map.get(String(category._id));
    if (!category.parent) {
      roots.push(node);
      return;
    }

    const parent = map.get(String(category.parent));
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

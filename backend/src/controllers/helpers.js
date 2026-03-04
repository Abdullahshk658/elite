import Category from '../models/Category.js';

export const getDescendantCategoryIds = async (rootId) => {
  const categories = await Category.find({}, '_id parent').lean();
  const parentToChildren = new Map();

  categories.forEach((category) => {
    const parentKey = category.parent ? String(category.parent) : 'root';
    if (!parentToChildren.has(parentKey)) {
      parentToChildren.set(parentKey, []);
    }
    parentToChildren.get(parentKey).push(String(category._id));
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

  categories.forEach((category) => {
    map.set(String(category._id), {
      ...category,
      children: []
    });
  });

  categories.forEach((category) => {
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

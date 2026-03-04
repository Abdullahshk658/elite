const toNumber = (value) => (value === null || value === undefined ? null : Number(value));

export const serializeCategory = (row) => ({
  _id: row.id,
  name: row.name,
  slug: row.slug,
  parent: row.parent_id,
  image: row.image,
  level: row.level,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const serializeProduct = (row, options = {}) => {
  const product = {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description,
    price: toNumber(row.price),
    salePrice: toNumber(row.sale_price),
    category: row.category_id,
    brand: row.brand,
    sizes: row.sizes || [],
    images: row.images || [],
    qualityTag: row.quality_tag,
    isFeatured: row.is_featured,
    isTrending: row.is_trending,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  if (options.withCategory) {
    product.category = row.category_ref_id
      ? {
          _id: row.category_ref_id,
          name: row.category_name,
          slug: row.category_slug
        }
      : null;
  }

  return product;
};

export const serializeOrder = (row) => ({
  _id: row.id,
  customer: row.customer,
  shippingAddress: row.shipping_address,
  items: row.items || [],
  total: toNumber(row.total),
  paymentMethod: row.payment_method,
  status: row.status,
  whatsappNotified: row.whatsapp_notified,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

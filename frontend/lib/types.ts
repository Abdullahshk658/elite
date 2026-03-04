export type ProductSize = {
  size: string;
  stock: number;
};

export type ProductImage = {
  url: string;
  publicId: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number | null;
  category?: { _id: string; name: string; slug: string };
  brand: string;
  sizes: ProductSize[];
  images: ProductImage[];
  qualityTag: '1:1' | 'Dot Perfect' | 'High-End' | 'Premium Plus Batch';
  isFeatured: boolean;
  isTrending: boolean;
  tags: string[];
  createdAt: string;
};

export type ProductListResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  products: Product[];
};

export type OrderPayload = {
  customer: { name: string; email: string; phone: string };
  shippingAddress: { street: string; city: string; province: string; postalCode: string };
  items: { product: string; size: string; qty: number; price: number }[];
  total: number;
  paymentMethod: 'COD' | 'Bank Transfer';
};

export type CategoryNode = {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  image: string;
  level: number;
  children: CategoryNode[];
};

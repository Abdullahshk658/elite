export const seedCategories = [
  {
    name: 'Sneakers',
    slug: 'sneakers',
    parentSlug: null,
    level: 0,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772'
  },
  {
    name: 'Running',
    slug: 'running',
    parentSlug: 'sneakers',
    level: 1,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c'
  },
  {
    name: 'Basketball',
    slug: 'basketball',
    parentSlug: 'sneakers',
    level: 1,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77'
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    parentSlug: 'sneakers',
    level: 1,
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d'
  },
  {
    name: 'Jordan Retro',
    slug: 'jordan-retro',
    parentSlug: 'basketball',
    level: 2,
    image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de'
  },
  {
    name: 'Dunk Low',
    slug: 'dunk-low',
    parentSlug: 'lifestyle',
    level: 2,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb'
  },
  {
    name: 'Yeezy Collection',
    slug: 'yeezy-collection',
    parentSlug: 'lifestyle',
    level: 2,
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782'
  },
  {
    name: 'Premium Running',
    slug: 'premium-running',
    parentSlug: 'running',
    level: 2,
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3'
  }
];

const defaultSizes = [
  { size: '40', stock: 6 },
  { size: '41', stock: 10 },
  { size: '42', stock: 14 },
  { size: '43', stock: 9 },
  { size: '44', stock: 4 }
];

const shoe = (product) => ({
  ...product,
  sizes: product.sizes || defaultSizes,
  tags: product.tags || [],
  images: [
    {
      url: product.image,
      publicId: `seed/${product.slug}`
    }
  ]
});

export const seedProducts = [
  shoe({
    name: 'Air Jordan 1 High Travis Fragment',
    slug: 'air-jordan-1-high-travis-fragment',
    sku: 'EK-JD-0001',
    description: 'Premium Plus batch with buttery leather and clean edge paint.',
    price: 28999,
    salePrice: 26499,
    categorySlug: 'jordan-retro',
    brand: 'Jordan',
    qualityTag: 'Premium Plus Batch',
    isFeatured: true,
    isTrending: true,
    tags: ['jordan', 'high', 'travis', 'fragment'],
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519'
  }),
  shoe({
    name: 'Air Jordan 4 Military Black',
    slug: 'air-jordan-4-military-black',
    sku: 'EK-JD-0002',
    description: 'Dot Perfect batch with accurate cage angles and heel tab shape.',
    price: 25499,
    salePrice: 23999,
    categorySlug: 'jordan-retro',
    brand: 'Jordan',
    qualityTag: 'Dot Perfect',
    isFeatured: true,
    isTrending: true,
    tags: ['jordan', 'aj4', 'military black'],
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06'
  }),
  shoe({
    name: 'Nike Dunk Low Panda',
    slug: 'nike-dunk-low-panda',
    sku: 'EK-NK-0003',
    description: 'High-End batch and daily wear comfort with clean panel alignment.',
    price: 18999,
    salePrice: 17499,
    categorySlug: 'dunk-low',
    brand: 'Nike',
    qualityTag: 'High-End',
    isFeatured: true,
    isTrending: true,
    tags: ['nike', 'dunk', 'panda'],
    image: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634'
  }),
  shoe({
    name: 'Nike Dunk Low Grey Fog',
    slug: 'nike-dunk-low-grey-fog',
    sku: 'EK-NK-0004',
    description: '1:1 batch with balanced swoosh proportions and subtle neutral tones.',
    price: 19499,
    salePrice: 17999,
    categorySlug: 'dunk-low',
    brand: 'Nike',
    qualityTag: '1:1',
    isFeatured: false,
    isTrending: true,
    tags: ['nike', 'dunk', 'grey fog'],
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb'
  }),
  shoe({
    name: 'Yeezy Boost 350 V2 Zebra',
    slug: 'yeezy-boost-350-v2-zebra',
    sku: 'EK-YZ-0005',
    description: 'Premium Plus batch with soft knit upper and responsive sole feel.',
    price: 22999,
    salePrice: 21499,
    categorySlug: 'yeezy-collection',
    brand: 'Adidas',
    qualityTag: 'Premium Plus Batch',
    isFeatured: true,
    isTrending: false,
    tags: ['yeezy', '350', 'zebra'],
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782'
  }),
  shoe({
    name: 'Yeezy 700 Wave Runner',
    slug: 'yeezy-700-wave-runner',
    sku: 'EK-YZ-0006',
    description: 'High-End batch with robust materials and shape-correct midsole.',
    price: 25999,
    salePrice: 24999,
    categorySlug: 'yeezy-collection',
    brand: 'Adidas',
    qualityTag: 'High-End',
    isFeatured: false,
    isTrending: true,
    tags: ['yeezy', '700', 'wave runner'],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772'
  }),
  shoe({
    name: 'New Balance 2002R Protection Pack Rain Cloud',
    slug: 'new-balance-2002r-rain-cloud',
    sku: 'EK-NB-0007',
    description: 'Dot Perfect batch with distressed suede layering and comfort foam.',
    price: 21499,
    salePrice: 19999,
    categorySlug: 'premium-running',
    brand: 'New Balance',
    qualityTag: 'Dot Perfect',
    isFeatured: true,
    isTrending: false,
    tags: ['new balance', '2002r', 'rain cloud'],
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2'
  }),
  shoe({
    name: 'Nike ZoomX Vaporfly Next%',
    slug: 'nike-zoomx-vaporfly-next',
    sku: 'EK-NK-0008',
    description: '1:1 running batch focused on lightweight upper and racing feel.',
    price: 27999,
    salePrice: 26999,
    categorySlug: 'premium-running',
    brand: 'Nike',
    qualityTag: '1:1',
    isFeatured: false,
    isTrending: false,
    tags: ['nike', 'running', 'zoomx'],
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c'
  }),
  shoe({
    name: 'Asics Gel-Kayano 14 Silver',
    slug: 'asics-gel-kayano-14-silver',
    sku: 'EK-AS-0009',
    description: 'High-End batch with mesh breathability and polished retro runners look.',
    price: 20999,
    salePrice: 19499,
    categorySlug: 'premium-running',
    brand: 'Asics',
    qualityTag: 'High-End',
    isFeatured: false,
    isTrending: true,
    tags: ['asics', 'gel kayano', 'runner'],
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77'
  }),
  shoe({
    name: 'Jordan 11 Cool Grey',
    slug: 'jordan-11-cool-grey',
    sku: 'EK-JD-0010',
    description: 'Premium Plus batch with glossy patent leather and snug collar fit.',
    price: 29999,
    salePrice: 28499,
    categorySlug: 'jordan-retro',
    brand: 'Jordan',
    qualityTag: 'Premium Plus Batch',
    isFeatured: false,
    isTrending: true,
    tags: ['jordan', 'aj11', 'cool grey'],
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570'
  }),
  shoe({
    name: 'Nike SB Dunk Low Jarritos',
    slug: 'nike-sb-dunk-low-jarritos',
    sku: 'EK-NK-0011',
    description: 'Dot Perfect batch with strong embroidery and crisp woven textures.',
    price: 26499,
    salePrice: 24999,
    categorySlug: 'dunk-low',
    brand: 'Nike',
    qualityTag: 'Dot Perfect',
    isFeatured: true,
    isTrending: true,
    tags: ['nike sb', 'dunk', 'jarritos'],
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d'
  }),
  shoe({
    name: 'Adidas Samba OG Black White',
    slug: 'adidas-samba-og-black-white',
    sku: 'EK-AD-0012',
    description: 'High-End batch with classic gum sole and precise toe stitching.',
    price: 16999,
    salePrice: 15499,
    categorySlug: 'lifestyle',
    brand: 'Adidas',
    qualityTag: 'High-End',
    isFeatured: true,
    isTrending: true,
    tags: ['adidas', 'samba', 'og'],
    image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f'
  })
];

export const seedUsers = [
  {
    name: 'EliteKicks Admin',
    email: 'admin@elitekicks.pk',
    password: 'Admin@123456',
    isAdmin: true
  },
  {
    name: 'Demo Customer',
    email: 'customer@elitekicks.pk',
    password: 'Customer@123',
    isAdmin: false
  }
];

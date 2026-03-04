'use client';

import Image from 'next/image';

const brands = [
  { name: 'Nike', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3' },
  { name: 'Adidas', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519' },
  { name: 'New Balance', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2' },
  { name: 'Jordan', image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de' },
  { name: 'Puma', image: 'https://images.unsplash.com/photo-1608256246200-53e8b47b2f26' }
];

export default function BrandIcons() {
  return (
    <section className="section-shell py-6">
      <h2 className="text-xl font-extrabold">Shop by Brand</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {brands.map((brand) => (
          <div key={brand.name} className="flex w-20 shrink-0 flex-col items-center gap-2">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-grey-light">
              <Image src={brand.image} alt={brand.name} fill className="object-cover" />
            </div>
            <span className="text-xs font-medium">{brand.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

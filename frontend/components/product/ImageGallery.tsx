'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ProductImage } from '@/lib/types';

export default function ImageGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);

  const safeImages = images.length
    ? images
    : [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', publicId: 'fallback' }];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-sharp border border-grey-light bg-white">
        <Image
          src={safeImages[active].url}
          alt="Product image"
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover transition duration-300 hover:scale-110"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {safeImages.map((image, index) => (
          <button
            key={`${image.publicId}-${index}`}
            onClick={() => setActive(index)}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-sharp border ${
              active === index ? 'border-black' : 'border-grey-light'
            }`}
          >
            <Image src={image.url} alt="Thumbnail" fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

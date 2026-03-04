'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPKR } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { addToCart } from '@/store/slices/cartSlice';

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const liked = useAppSelector((state) => state.wishlist.ids.includes(product._id));

  const firstSize = product.sizes.find((entry) => entry.stock > 0)?.size || product.sizes[0]?.size || '42';

  return (
    <article className="group rounded-sharp border border-grey-light bg-white p-3 shadow-card transition hover:-translate-y-0.5">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-sharp">
        <Image
          src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link href={`/products/${product.slug}`} className="line-clamp-1 text-sm font-semibold">
            {product.name}
          </Link>
          <p className="text-xs text-grey-mid">{product.brand}</p>
        </div>
        <button
          onClick={() => dispatch(toggleWishlist(product._id))}
          className={`rounded-sharp border p-1.5 ${liked ? 'border-black bg-black text-accent' : 'border-grey-light'}`}
          aria-label="Wishlist toggle"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm font-bold">{formatPKR(product.salePrice || product.price)}</span>
        {product.salePrice && <span className="text-xs text-grey-mid line-through">{formatPKR(product.price)}</span>}
      </div>

      <div className="mt-2">
        <Badge label={product.qualityTag} />
      </div>

      <Button
        className="mt-3 w-full"
        onClick={() =>
          dispatch(
            addToCart({
              productId: product._id,
              slug: product.slug,
              name: product.name,
              image: product.images?.[0]?.url || '',
              size: firstSize,
              qty: 1,
              price: product.salePrice || product.price
            })
          )
        }
      >
        Add to Cart
      </Button>
    </article>
  );
}

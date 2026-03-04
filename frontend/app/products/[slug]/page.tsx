'use client';

import Link from 'next/link';
import { Heart, MessageCircle, ShoppingBag } from 'lucide-react';
import ImageGallery from '@/components/product/ImageGallery';
import SizeSelector from '@/components/product/SizeSelector';
import BatchTooltip from '@/components/product/BatchTooltip';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';
import Skeleton from '@/components/ui/Skeleton';
import { formatPKR } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useGetProductBySlugQuery } from '@/store/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';

const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data, isLoading } = useGetProductBySlugQuery(slug);
  const product = data?.product;
  const related = data?.related || [];

  const [size, setSize] = useState('');
  const dispatch = useAppDispatch();
  const wishlisted = useAppSelector((state) => product && state.wishlist.ids.includes(product._id));

  if (isLoading) {
    return (
      <section className="section-shell py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[420px]" />
          <Skeleton className="h-[420px]" />
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="section-shell py-10">
        <p>Product not found.</p>
      </section>
    );
  }

  const selectedSize =
    size || product.sizes.find((entry: any) => entry.stock > 0)?.size || product.sizes[0]?.size;
  const message = `Hi, I want to order: ${product.name} | Size: ${selectedSize} | Link: ${siteUrl}/products/${product.slug}`;

  return (
    <section className="section-shell py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <ImageGallery images={product.images} />

        <div>
          <p className="text-sm uppercase tracking-wider text-grey-mid">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-extrabold">{product.name}</h1>
          <p className="mt-3 text-sm text-grey-mid">{product.description}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold">{formatPKR(product.salePrice || product.price)}</span>
            {product.salePrice && (
              <span className="text-sm text-grey-mid line-through">{formatPKR(product.price)}</span>
            )}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">Select Size</p>
            <SizeSelector sizes={product.sizes} value={selectedSize} onChange={setSize} />
          </div>

          <div className="mt-4">
            <BatchTooltip qualityTag={product.qualityTag} />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button
              onClick={() =>
                dispatch(
                  addToCart({
                    productId: product._id,
                    slug: product.slug,
                    name: product.name,
                    image: product.images?.[0]?.url || '',
                    size: selectedSize,
                    qty: 1,
                    price: product.salePrice || product.price
                  })
                )
              }
            >
              Add to Cart
            </Button>
            <Button variant="ghost" onClick={() => dispatch(toggleWishlist(product._id))}>
              {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </Button>
          </div>

          <Link
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            className="mt-4 inline-flex items-center gap-2 rounded-sharp border border-black bg-black px-4 py-2 text-sm font-semibold text-accent"
          >
            <MessageCircle className="h-4 w-4" /> Order on WhatsApp
          </Link>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-extrabold">Related Products</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
          {related.map((item: any) => (
            <div key={item._id} className="w-60 shrink-0">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-grey-light bg-white p-3 lg:hidden">
        <div className="section-shell flex gap-2">
          <button
            onClick={() => dispatch(toggleWishlist(product._id))}
            className="inline-flex h-11 w-11 items-center justify-center rounded-sharp border border-grey-light"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
          <Button
            className="flex-1"
            onClick={() =>
              dispatch(
                addToCart({
                  productId: product._id,
                  slug: product.slug,
                  name: product.name,
                  image: product.images?.[0]?.url || '',
                  size: selectedSize,
                  qty: 1,
                  price: product.salePrice || product.price
                })
              )
            }
          >
            <ShoppingBag className="mr-1 h-4 w-4" /> Add
          </Button>
          <Link
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            className="inline-flex h-11 items-center justify-center rounded-sharp border border-black bg-black px-4 text-accent"
          >
            <MessageCircle className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

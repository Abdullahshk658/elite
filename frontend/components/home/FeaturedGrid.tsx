'use client';

import ProductCard from '@/components/product/ProductCard';
import Skeleton from '@/components/ui/Skeleton';
import { useGetProductsQuery } from '@/store/services/api';

export default function FeaturedGrid() {
  const { data, isLoading } = useGetProductsQuery({ featured: true, limit: 8 });

  return (
    <section className="section-shell py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Featured Picks</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-72 w-full" />)}
        {(data?.products || []).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

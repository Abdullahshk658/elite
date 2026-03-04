'use client';

import ProductCard from '@/components/product/ProductCard';
import { useGetProductsQuery } from '@/store/services/api';
import Skeleton from '@/components/ui/Skeleton';

export default function TrendingSection() {
  const { data, isLoading } = useGetProductsQuery({ trending: true, limit: 10 });

  return (
    <section className="section-shell py-10">
      <h2 className="text-2xl font-extrabold">Trending Now</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
        {isLoading &&
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-56 shrink-0" />
          ))}
        {(data?.products || []).map((product) => (
          <div key={product._id} className="w-60 shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

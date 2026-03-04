'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useGetProductsQuery } from '@/store/services/api';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const qualityOptions = ['', '1:1', 'Dot Perfect', 'High-End', 'Premium Plus Batch'];

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(
    () => ({
      sort: searchParams.get('sort') || 'newest',
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      size: searchParams.get('size') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      qualityTag: searchParams.get('qualityTag') || ''
    }),
    [searchParams]
  );

  useEffect(() => {
    setPage(1);
  }, [
    filters.sort,
    filters.category,
    filters.brand,
    filters.size,
    filters.minPrice,
    filters.maxPrice,
    filters.qualityTag
  ]);

  const { data, isLoading, isFetching } = useGetProductsQuery({
    page,
    limit: 8,
    sort: filters.sort,
    category: filters.category || undefined,
    brand: filters.brand || undefined,
    size: filters.size || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    qualityTag: filters.qualityTag || undefined
  });

  const [loadedProducts, setLoadedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!data?.products) return;
    if (page === 1) {
      setLoadedProducts(data.products);
    } else {
      setLoadedProducts((prev) => [...prev, ...data.products]);
    }
  }, [data, page]);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const FilterPanel = (
    <div className="space-y-4 rounded-sharp border border-grey-light bg-white p-4">
      <h3 className="text-sm font-bold uppercase">Filters</h3>
      <div className="space-y-2 text-sm">
        <label className="block font-medium">Brand</label>
        <input
          className="w-full rounded-sharp border border-grey-light px-3 py-2"
          placeholder="Nike, Adidas"
          value={filters.brand}
          onChange={(event) => updateQuery('brand', event.target.value)}
        />
      </div>

      <div className="space-y-2 text-sm">
        <label className="block font-medium">Size</label>
        <input
          className="w-full rounded-sharp border border-grey-light px-3 py-2"
          placeholder="42"
          value={filters.size}
          onChange={(event) => updateQuery('size', event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <label className="block font-medium">Min PKR</label>
          <input
            className="w-full rounded-sharp border border-grey-light px-3 py-2"
            value={filters.minPrice}
            onChange={(event) => updateQuery('minPrice', event.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium">Max PKR</label>
          <input
            className="w-full rounded-sharp border border-grey-light px-3 py-2"
            value={filters.maxPrice}
            onChange={(event) => updateQuery('maxPrice', event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <label className="block font-medium">Quality Batch</label>
        <select
          className="w-full rounded-sharp border border-grey-light px-3 py-2"
          value={filters.qualityTag}
          onChange={(event) => updateQuery('qualityTag', event.target.value)}
        >
          {qualityOptions.map((option) => (
            <option key={option || 'all'} value={option}>
              {option || 'All'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <section className="section-shell py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Sneaker Catalogue</h1>
          {filters.category && (
            <p className="mt-1 text-xs uppercase tracking-wide text-grey-mid">
              Category: {filters.category.replaceAll('-', ' ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex rounded-sharp border border-grey-light p-2 lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
            aria-label="Open mobile filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <select
            value={filters.sort}
            onChange={(event) => updateQuery('sort', event.target.value)}
            className="rounded-sharp border border-grey-light px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price Low to High</option>
            <option value="price-desc">Price High to Low</option>
            <option value="best-selling">Best Selling</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">{FilterPanel}</aside>
        <div>
          {isLoading && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-72" />
              ))}
            </div>
          )}

          {!isLoading && (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {loadedProducts.map((product) => (
                  <ProductCard key={`${product._id}-${product.createdAt}`} product={product} />
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  disabled={isFetching || page >= (data?.totalPages || 1)}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  {page >= (data?.totalPages || 1) ? 'No More Products' : isFetching ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-xl bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            {FilterPanel}
            <Button className="mt-3 w-full" onClick={() => setMobileFiltersOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<section className="section-shell py-8"><Skeleton className="h-72" /></section>}>
      <ProductsContent />
    </Suspense>
  );
}

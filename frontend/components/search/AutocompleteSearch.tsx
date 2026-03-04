'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchProductsQuery } from '@/store/services/api';
import { formatPKR } from '@/lib/utils';

export default function AutocompleteSearch() {
  const [input, setInput] = useState('');
  const [debounced, setDebounced] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(input), 300);
    return () => clearTimeout(timeout);
  }, [input]);

  const { data = [] } = useSearchProductsQuery(debounced, {
    skip: debounced.trim().length < 2
  });

  const items = useMemo(() => data.slice(0, 6), [data]);

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center rounded-sharp border border-grey-light bg-white px-3">
        <Search className="h-4 w-4 text-grey-mid" />
        <input
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setFocusedIndex(-1);
          }}
          onKeyDown={(event) => {
            if (!items.length) return;
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setFocusedIndex((prev) => (prev + 1) % items.length);
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setFocusedIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
            }
            if (event.key === 'Enter' && focusedIndex >= 0) {
              window.location.href = `/products/${items[focusedIndex].slug}`;
            }
          }}
          placeholder="Search sneakers, brands..."
          className="h-10 w-full bg-transparent px-2 text-sm outline-none"
          aria-label="Search products"
        />
      </div>

      {items.length > 0 && (
        <div className="absolute top-12 z-30 w-full rounded-sharp border border-grey-light bg-white shadow-card">
          {items.map((item, index) => (
            <Link
              key={item._id}
              href={`/products/${item.slug}`}
              className={`flex items-center gap-3 px-3 py-2 transition ${
                focusedIndex === index ? 'bg-grey-light' : 'hover:bg-grey-light'
              }`}
            >
              <Image
                src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                alt={item.name}
                width={42}
                height={42}
                className="rounded-sharp object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-grey-mid">{formatPKR(item.salePrice || item.price || 0)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

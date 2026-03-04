'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useGetCategoriesTreeQuery } from '@/store/services/api';

export default function MegaMenu() {
  const [open, setOpen] = useState(false);
  const { data } = useGetCategoriesTreeQuery();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-sm font-medium text-white"
      >
        Categories <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 top-8 z-40 w-[320px] rounded-sharp border border-grey-dark bg-black p-4 text-white shadow-card">
          <div className="grid gap-3">
            {(data || []).map((root) => (
              <div key={root._id} className="border-b border-grey-dark pb-3 last:border-b-0">
                <Link href={`/products?category=${root.slug}`} className="font-semibold text-accent">
                  {root.name}
                </Link>
                <div className="mt-2 flex flex-wrap gap-2">
                  {root.children?.map((child) => (
                    <Link
                      key={child._id}
                      href={`/products?category=${child.slug}`}
                      className="rounded-sharp border border-grey-dark px-2 py-1 text-xs hover:border-accent"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

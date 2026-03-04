'use client';

import { ProductSize } from '@/lib/types';

export default function SizeSelector({
  sizes,
  value,
  onChange
}: {
  sizes: ProductSize[];
  value: string;
  onChange: (size: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((item) => {
        const outOfStock = item.stock <= 0;
        return (
          <button
            key={item.size}
            disabled={outOfStock}
            onClick={() => onChange(item.size)}
            className={`rounded-sharp border px-3 py-2 text-sm transition ${
              outOfStock
                ? 'cursor-not-allowed border-grey-light bg-grey-light text-grey-mid'
                : value === item.size
                  ? 'border-black bg-black text-white'
                  : 'border-grey-dark bg-white hover:border-black'
            }`}
          >
            {item.size}
          </button>
        );
      })}
    </div>
  );
}

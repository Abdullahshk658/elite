'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { formatPKR } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeFromCart, updateQty } from '@/store/slices/cartSlice';

export default function CartDrawer() {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  if (!items.length) {
    return (
      <div className="rounded-sharp border border-grey-light bg-white p-5">
        <p className="text-sm text-grey-mid">Your cart is empty.</p>
        <Link href="/products" className="mt-3 inline-block">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-sharp border border-grey-light bg-white p-4">
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex gap-3 border-b border-grey-light pb-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-sharp border border-grey-light">
              <Image src={item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-grey-mid">Size {item.size}</p>
              <p className="text-xs font-semibold">{formatPKR(item.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={item.qty}
                  min={1}
                  onChange={(event) =>
                    dispatch(
                      updateQty({
                        productId: item.productId,
                        size: item.size,
                        qty: Number(event.target.value)
                      })
                    )
                  }
                  className="w-16 rounded-sharp border border-grey-light px-2 py-1 text-sm"
                />
                <button
                  onClick={() => dispatch(removeFromCart({ productId: item.productId, size: item.size }))}
                  className="text-xs text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

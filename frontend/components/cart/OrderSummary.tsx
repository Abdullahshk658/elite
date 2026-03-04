'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { formatPKR } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

export default function OrderSummary() {
  const items = useAppSelector((state) => state.cart.items);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = items.length ? 250 : 0;
  const total = subtotal + shipping;

  return (
    <aside className="rounded-sharp border border-grey-light bg-white p-5 shadow-card">
      <h3 className="text-lg font-bold">Order Summary</h3>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPKR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{formatPKR(shipping)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-grey-light pt-3 text-base font-bold">
          <span>Total</span>
          <span>{formatPKR(total)}</span>
        </div>
      </div>
      <Link href="/checkout" className="mt-4 block">
        <Button className="w-full">Proceed to Checkout</Button>
      </Link>
    </aside>
  );
}

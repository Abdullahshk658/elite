'use client';

import CartDrawer from '@/components/cart/CartDrawer';
import OrderSummary from '@/components/cart/OrderSummary';

export default function CartPage() {
  return (
    <section className="section-shell py-8">
      <h1 className="text-2xl font-extrabold">Your Cart</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <CartDrawer />
        <OrderSummary />
      </div>
    </section>
  );
}

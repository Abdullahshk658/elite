'use client';

import MultiStepForm from '@/components/checkout/MultiStepForm';

export default function CheckoutPage() {
  return (
    <section className="section-shell py-8">
      <h1 className="text-2xl font-extrabold">Checkout</h1>
      <div className="mt-6 max-w-3xl">
        <MultiStepForm />
      </div>
    </section>
  );
}

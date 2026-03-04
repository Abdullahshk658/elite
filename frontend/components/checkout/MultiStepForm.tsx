'use client';

import { FormEvent, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import CODOption from './CODOption';
import BankTransferOption from './BankTransferOption';
import { useCreateOrderMutation } from '@/store/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';

const pakistanCities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar'];

export default function MultiStepForm() {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: 'Karachi',
    province: 'Sindh',
    postalCode: '74000',
    paymentMethod: 'COD' as 'COD' | 'Bank Transfer'
  });

  const total = useMemo(() => items.reduce((sum, item) => sum + item.qty * item.price, 0) + 250, [items]);

  const placeOrder = async (event: FormEvent) => {
    event.preventDefault();

    if (!items.length) return;

    const payload = {
      customer: { name: form.name, email: form.email, phone: form.phone },
      shippingAddress: {
        street: form.street,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode
      },
      items: items.map((item) => ({
        product: item.productId,
        size: item.size,
        qty: item.qty,
        price: item.price
      })),
      total,
      paymentMethod: form.paymentMethod
    };

    await createOrder(payload).unwrap();
    dispatch(clearCart());
    setStep(4);
  };

  return (
    <form className="rounded-sharp border border-grey-light bg-white p-5" onSubmit={placeOrder}>
      <div className="mb-4 flex gap-2 text-xs font-semibold uppercase">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`rounded-sharp px-2 py-1 ${step >= i ? 'bg-accent text-black' : 'bg-grey-light text-grey-mid'}`}>
            Step {i}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Cart Review</h3>
          <p className="text-sm text-grey-mid">{items.length} item(s) ready for checkout.</p>
          <Button type="button" onClick={() => setStep(2)}>Continue</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Shipping Info</h3>
          <input className="w-full rounded-sharp border border-grey-light px-3 py-2" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="w-full rounded-sharp border border-grey-light px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="w-full rounded-sharp border border-grey-light px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <input className="w-full rounded-sharp border border-grey-light px-3 py-2" placeholder="Street Address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
          <input list="pak-cities" className="w-full rounded-sharp border border-grey-light px-3 py-2" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          <datalist id="pak-cities">
            {pakistanCities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          <div className="flex gap-2">
            <input className="w-full rounded-sharp border border-grey-light px-3 py-2" placeholder="Province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} required />
            <input className="w-full rounded-sharp border border-grey-light px-3 py-2" placeholder="Postal Code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required />
          </div>
          <Button type="button" onClick={() => setStep(3)}>Continue to Payment</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Payment</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block cursor-pointer" onClick={() => setForm({ ...form, paymentMethod: 'COD' })}>
              <CODOption />
              <input type="radio" name="paymentMethod" checked={form.paymentMethod === 'COD'} readOnly className="mt-2" />
            </label>
            <label className="block cursor-pointer" onClick={() => setForm({ ...form, paymentMethod: 'Bank Transfer' })}>
              <BankTransferOption />
              <input type="radio" name="paymentMethod" checked={form.paymentMethod === 'Bank Transfer'} readOnly className="mt-2" />
            </label>
          </div>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Placing Order...' : 'Confirm Order'}</Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Order Confirmed</h3>
          <p className="text-sm text-grey-mid">Your order has been placed and admin notification is queued on WhatsApp.</p>
        </div>
      )}
    </form>
  );
}

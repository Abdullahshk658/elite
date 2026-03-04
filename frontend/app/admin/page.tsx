'use client';

import { useGetProductsQuery } from '@/store/services/api';

export default function AdminPage() {
  const { data } = useGetProductsQuery({ page: 1, limit: 5 });

  return (
    <section className="section-shell py-8">
      <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-sharp border border-grey-light bg-white p-4">
          <p className="text-xs text-grey-mid">Revenue</p>
          <p className="text-xl font-bold">PKR --</p>
        </div>
        <div className="rounded-sharp border border-grey-light bg-white p-4">
          <p className="text-xs text-grey-mid">Orders</p>
          <p className="text-xl font-bold">--</p>
        </div>
        <div className="rounded-sharp border border-grey-light bg-white p-4">
          <p className="text-xs text-grey-mid">Products</p>
          <p className="text-xl font-bold">{data?.total || 0}</p>
        </div>
        <div className="rounded-sharp border border-grey-light bg-white p-4">
          <p className="text-xs text-grey-mid">Low Stock</p>
          <p className="text-xl font-bold">--</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-grey-mid">Use protected admin API routes for live order and stock management.</p>
    </section>
  );
}

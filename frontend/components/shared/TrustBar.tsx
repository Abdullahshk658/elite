import { Truck, ShieldCheck, Wallet } from 'lucide-react';

const items = [
  { label: 'Free Delivery', icon: Truck },
  { label: 'COD Available', icon: Wallet },
  { label: '100% Authentic Batches', icon: ShieldCheck }
];

export default function TrustBar() {
  return (
    <section className="bg-black py-3 text-white">
      <div className="section-shell grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-center gap-2 text-sm">
            <item.icon className="h-4 w-4 text-accent" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

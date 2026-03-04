import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-grey-light bg-black text-white">
      <div className="section-shell grid gap-8 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-extrabold text-accent">EliteKicks</h3>
          <p className="mt-2 text-sm text-grey-light">
            Pakistan's curated sneaker and replica marketplace with premium quality tiers.
          </p>
        </div>

        <div className="text-sm">
          <h4 className="font-semibold">Shop</h4>
          <div className="mt-3 grid gap-2">
            <Link href="/products">All Products</Link>
            <Link href="/sneaker-care">Sneaker Care</Link>
            <Link href="/checkout">Checkout</Link>
          </div>
        </div>

        <div className="text-sm">
          <h4 className="font-semibold">Support</h4>
          <div className="mt-3 grid gap-2 text-grey-light">
            <p>COD Available Nationwide</p>
            <p>WhatsApp: +92 300 1234567</p>
            <p>Email: support@elitekicks.pk</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

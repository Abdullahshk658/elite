'use client';

import Link from 'next/link';
import { Menu, ShoppingBag, Heart } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import AutocompleteSearch from '@/components/search/AutocompleteSearch';
import MegaMenu from './MegaMenu';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useAppSelector((state) => state.cart.items.reduce((sum, item) => sum + item.qty, 0));
  const wishlistCount = useAppSelector((state) => state.wishlist.ids.length);

  return (
    <header className="sticky top-0 z-40 border-b border-grey-dark bg-black text-white">
      <div className="section-shell flex h-16 items-center gap-4">
        <button
          className="inline-flex lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="text-lg font-extrabold tracking-tight text-accent">
          EliteKicks
        </Link>

        <div className="hidden lg:block">
          <MegaMenu />
        </div>

        <div className="ml-auto hidden md:block">
          <AutocompleteSearch />
        </div>

        <div className="ml-auto flex items-center gap-3 md:ml-4">
          <Link href="/cart" className="inline-flex items-center gap-1 text-sm">
            <ShoppingBag className="h-4 w-4" /> {cartCount}
          </Link>
          <Link href="/products" className="inline-flex items-center gap-1 text-sm">
            <Heart className="h-4 w-4" /> {wishlistCount}
          </Link>
        </div>
      </div>

      <div className="section-shell pb-3 md:hidden">
        <AutocompleteSearch />
      </div>

      {mobileOpen && (
        <div className="border-t border-grey-dark bg-black lg:hidden">
          <div className="section-shell py-3">
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/products" onClick={() => setMobileOpen(false)}>
                Shop All
              </Link>
              <Link href="/sneaker-care" onClick={() => setMobileOpen(false)}>
                Sneaker Care
              </Link>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link href="/admin" onClick={() => setMobileOpen(false)}>
                Admin
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StoreProvider from '@/store/StoreProvider';
import WhatsAppButton from '@/components/shared/WhatsAppButton';

const inter = Inter({ subsets: ['latin'], variable: '--font-heading' });
const roboto = Roboto({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: 'EliteKicks',
  description: 'Pakistan sneaker and replica market e-commerce app'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable}`}>
      <body className="font-[var(--font-body)] bg-white text-black">
        <StoreProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </StoreProvider>
      </body>
    </html>
  );
}

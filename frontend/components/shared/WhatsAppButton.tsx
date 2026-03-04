'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567';

export default function WhatsAppButton() {
  return (
    <Link
      href={`https://wa.me/${number}`}
      target="_blank"
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-black shadow-card transition hover:scale-105"
      aria-label="Open WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
    </Link>
  );
}

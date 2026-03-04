'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';

const slides = [
  {
    title: 'New Drops: Jordan, Yeezy, Dunks',
    subtitle: 'Elite batches curated for Pakistan sneakerheads.',
    cta: '/products?sort=newest'
  },
  {
    title: 'Premium Plus Batch Collection',
    subtitle: 'Sharp detailing, comfort, and street-accurate finishes.',
    cta: '/products?qualityTag=Premium%20Plus%20Batch'
  },
  {
    title: 'COD Nationwide',
    subtitle: 'Order now and pay on delivery with fast dispatch.',
    cta: '/products'
  }
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = useMemo(() => slides[index], [index]);

  return (
    <section
      className="soft-grid border-b border-grey-light bg-black text-white"
      onTouchStart={(event) => setTouchStart(event.changedTouches[0].clientX)}
      onTouchEnd={(event) => {
        if (touchStart === null) return;
        const delta = event.changedTouches[0].clientX - touchStart;
        if (delta > 60) setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
        if (delta < -60) setIndex((prev) => (prev + 1) % slides.length);
      }}
    >
      <div className="section-shell py-20">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-accent">New Drops</p>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">{slide.title}</h1>
        <p className="mt-4 max-w-xl text-grey-light">{slide.subtitle}</p>
        <Link href={slide.cta} className="mt-8 inline-block">
          <Button>Shop Now</Button>
        </Link>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';

const testimonials = [
  { name: 'Usman K.', city: 'Lahore', text: 'Best Dot Perfect batch I have bought locally.' },
  { name: 'Areeba M.', city: 'Karachi', text: 'Delivery was fast and quality matched photos.' },
  { name: 'Hamza A.', city: 'Islamabad', text: 'Support team guided me for sizing on WhatsApp.' }
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const item = testimonials[index];

  return (
    <section className="section-shell py-14">
      <h2 className="text-2xl font-extrabold">Customer Heat Check</h2>
      <div className="mt-6 rounded-sharp border border-grey-light bg-white p-6 shadow-card">
        <p className="text-lg font-medium">"{item.text}"</p>
        <p className="mt-3 text-sm text-grey-mid">{item.name} � {item.city} � ?????</p>
      </div>
    </section>
  );
}

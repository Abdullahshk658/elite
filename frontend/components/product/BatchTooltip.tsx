'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

const tierDescriptions: Record<string, string> = {
  '1:1': 'Closest factory-level match with premium materials.',
  'Dot Perfect': 'High detail batch with precise logo and stitching alignment.',
  'High-End': 'Strong quality and comfort with excellent finishing.',
  'Premium Plus Batch': 'Top-tier curated pair with best visual and build output.'
};

export default function BatchTooltip({ qualityTag }: { qualityTag: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-2">
      <span className="text-sm font-semibold">Batch Info</span>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((prev) => !prev)}
        className="rounded-sharp border border-grey-light p-1"
      >
        <Info className="h-4 w-4" />
      </button>
      {show && (
        <div className="absolute left-0 top-8 z-20 w-64 rounded-sharp border border-grey-light bg-white p-3 text-xs shadow-card">
          <p className="font-semibold">{qualityTag}</p>
          <p className="mt-1 text-grey-mid">{tierDescriptions[qualityTag] || 'Premium curated quality batch.'}</p>
        </div>
      )}
    </div>
  );
}

'use client';

import HeroSlider from '@/components/home/HeroSlider';
import FeaturedGrid from '@/components/home/FeaturedGrid';
import BrandIcons from '@/components/home/BrandIcons';
import TrendingSection from '@/components/home/TrendingSection';
import TrustBar from '@/components/shared/TrustBar';
import Testimonials from '@/components/shared/Testimonials';

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <TrustBar />
      <FeaturedGrid />
      <BrandIcons />
      <TrendingSection />
      <Testimonials />
    </>
  );
}

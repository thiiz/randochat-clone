'use client';

import { useRef } from 'react';
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  CTASection,
  Footer
} from '@/components/landing';
import { FloatingVideo } from '@/components/landing/floating-video';

const LandingPage = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <main className='relative min-h-screen overflow-x-hidden'>
      <Navbar />

      {/* Scroll container for video animation - covers all sections until footer */}
      <div ref={scrollContainerRef} className='relative'>
        {/* Floating video that crosses the screen */}
        <FloatingVideo
          src='/hero-video.webm'
          containerRef={scrollContainerRef}
        />

        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <div id='features'>
          <FeaturesSection />
        </div>

        <div id='how-it-works'>
          <HowItWorksSection />
        </div>
        <CTASection />
      </div>

      <Footer />
    </main>
  );
};

export default LandingPage;

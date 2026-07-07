'use client';

import React, { useEffect } from 'react';
import Navbar from './landing/navbar';
import Hero from './landing/hero';
import Features from './landing/features';
import Pricing from './landing/pricing';
import Footer from './landing/footer';

export default function LandingPage({ onStart }: { onStart: (plan?: 'Pro' | 'Business') => void }) {
  // Ensure we start at the top of the page when mounting
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-background text-on-background font-body-lg antialiased min-h-screen flex flex-col">
      <Navbar onStart={onStart} />
      
      <main className="pt-24 pb-stack-lg flex-1">
        <Hero onStart={onStart} />
        <Features />
        <Pricing onStart={onStart} />
      </main>

      <Footer />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { ProductionHeader } from '@/layout';
import { ProductionHero } from '@/layout';
import { ProductionPresaleCard } from '@/features/presale';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { DEMO_MODE } from '@/lib/config';

// Import styles
import '@/styles/layout/production-layout.css';
import '@/styles/features/production-cards.css';
import '@/styles/features/production-wallet.css';
import '@/styles/global/vibes-design-system.css';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-900 via-black to-green-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-400 text-lg font-medium">Loading VIBES DeFi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-800">
      {/* Demo Mode Banner */}
      {DEMO_MODE && <StatusBanner />}
      
      {/* Header */}
      <ProductionHeader />
      
      {/* Hero Section */}
      <ProductionHero />
      
      {/* Main Content */}
      <main className="relative z-10">
        <ProductionPresaleCard />
      </main>
    </div>
  );
}

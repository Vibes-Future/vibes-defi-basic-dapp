'use client';

import React, { useEffect, useState } from 'react';
import { ProductionHeader } from '@/components/layout';
import { ProductionHero } from '@/components/layout';
import { ProductionPresaleCard } from '@/components/features/presale';
import { ModernVestingCard } from '@/components/features/vesting';

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
      {/* Header */}
      <ProductionHeader />
      
      {/* Hero Section */}
      <ProductionHero />
      
      {/* Main Content */}
      <main className="relative z-10">
        {/* Presale Section */}
        <ProductionPresaleCard />
        

        
        {/* Vesting Section */}
        <section id="vesting" className="section-spacing">
          <div className="container-spacing">
            <div className="text-center mb-32">
              <h2 className="heading-xl text-gradient mb-8">
                ⏰ VIBES Vesting
              </h2>
              <p className="body-lg text-gray-300 max-w-3xl mx-auto mb-16">
                Manage your vested VIBES tokens with our flexible vesting system. 
                Track your unlocked tokens and claim them when available.
              </p>
            </div>
            <ModernVestingCard />
          </div>
        </section>
      </main>
    </div>
  );
}

'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { DEMO_MODE } from '@/lib/config';

export const Hero: React.FC = () => {
  const { connected } = useWallet();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-primary-1/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-highlight-1/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container relative z-10 p-mobile sm:p-tablet lg:p-desktop">
        <div className="text-center animate-fade-in">
          {/* Main Heading */}
          <h1 className="text-heading font-bold mb-4 sm:mb-6">
            <span className="block text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gradient mb-2 sm:mb-4 leading-tight">
              VIBES
            </span>
            <span className="block text-lg xs:text-xl sm:text-2xl md:text-4xl lg:text-5xl text-white leading-tight">
              Complete DeFi Ecosystem
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
            Experience the future of decentralized finance with our comprehensive platform 
            featuring <span className="text-primary-1 font-semibold">token presale</span>, 
            <span className="text-highlight-1 font-semibold"> high-yield staking</span>, and 
            <span className="text-primary-2 font-semibold"> flexible vesting</span> on Solana.
          </p>

          {/* Stats Row - Mobile optimized */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-12 px-4 sm:px-0">
            <div className="card-glass p-3 sm:p-6 text-center animate-slide-up">
              <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1 sm:mb-2">40%</div>
              <div className="text-xs sm:text-sm text-gray-300">Staking APY</div>
            </div>
            <div className="card-glass p-3 sm:p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1 sm:mb-2">$0.0598</div>
              <div className="text-xs sm:text-sm text-gray-300">Presale Price</div>
            </div>
            <div className="card-glass p-3 sm:p-6 text-center animate-slide-up xs:col-span-2 md:col-span-1" style={{ animationDelay: '0.2s' }}>
              <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1 sm:mb-2">15M</div>
              <div className="text-xs sm:text-sm text-gray-300">Vesting Period</div>
            </div>
          </div>

          {/* CTA Buttons - Mobile optimized */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-16 px-4 sm:px-0">
            {!connected ? (
              <div className="text-center w-full max-w-sm">
                <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">Connect your wallet to get started</p>
                <div className="animate-pulse">
                  <div className="btn btn-primary opacity-75 cursor-not-allowed w-full touch-target">
                    Connect Wallet First
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-lg">
                <button 
                  onClick={() => scrollToSection('presale')}
                  className="btn btn-primary btn-lg animate-slide-up w-full sm:w-auto touch-target"
                  style={{ animationDelay: '0.3s' }}
                >
                  🚀 Join Presale
                </button>
                <button 
                  onClick={() => scrollToSection('staking')}
                  className="btn btn-secondary btn-lg animate-slide-up w-full sm:w-auto touch-target"
                  style={{ animationDelay: '0.4s' }}
                >
                  📈 Start Staking
                </button>
              </div>
            )}
          </div>

          {/* Protocol Status - Mobile optimized */}
          <div className="card-glass max-w-4xl mx-auto p-4 sm:p-6 animate-slide-up mx-4 sm:mx-auto" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-lg sm:text-xl font-heading font-semibold mb-3 sm:mb-4 text-gradient">
              🌟 Protocol Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <div className={`w-2 sm:w-3 h-2 sm:h-3 ${DEMO_MODE ? 'bg-warning' : 'bg-success'} rounded-full mr-2`}></div>
                  <span className="text-xs sm:text-sm font-medium">Presale</span>
                </div>
                <div className="text-xs text-gray-400">{DEMO_MODE ? 'Demo' : 'Active'}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 bg-success rounded-full mr-2"></div>
                  <span className="text-xs sm:text-sm font-medium">Staking</span>
                </div>
                <div className="text-xs text-gray-400">Live</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 bg-success rounded-full mr-2"></div>
                  <span className="text-xs sm:text-sm font-medium">Vesting</span>
                </div>
                <div className="text-xs text-gray-400">Ready</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 bg-info rounded-full mr-2"></div>
                  <span className="text-xs sm:text-sm font-medium">Network</span>
                </div>
                <div className="text-xs text-gray-400">Devnet</div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator - Hide on very small screens */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
            <div className="w-6 h-10 border-2 border-primary-1 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary-1 rounded-full mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
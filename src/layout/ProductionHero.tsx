'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';

const ProductionHero: React.FC = () => {
  const { connected } = useWallet();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="production-hero">
      {/* Background Effects */}
      <div className="hero-background">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
      </div>

      <div className="hero-content">
        {/* Main Title */}
        <h1 className="hero-title">
          VIBES DeFi
        </h1>
        
        <h2 className="hero-subtitle">
          The Future of Decentralized Finance
        </h2>
        
        <p className="hero-description">
          Experience next-generation DeFi with our comprehensive ecosystem featuring 
          token presales, high-yield staking, and flexible vesting solutions built on Solana.
        </p>

        {/* Statistics */}
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-value">40%</div>
            <div className="stat-label">Staking APY</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">$0.0598</div>
            <div className="stat-label">Starting Price</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">Sep 2025</div>
            <div className="stat-label">Presale Start</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="hero-cta">
          {!connected ? (
            <div className="text-center">
              <p className="text-gray-300 mb-6 text-lg">Connect your wallet to get started</p>
              <div className="status-indicator">
                <div className="status-dot"></div>
                <span className="status-text">Wallet connection required</span>
              </div>
            </div>
          ) : (
            <>
              <div className="cta-buttons">
                <button 
                  onClick={() => scrollToSection('presale')}
                  className="btn-primary"
                >
                  <span>🚀</span>
                  Join Presale
                </button>
                <button 
                  onClick={() => scrollToSection('staking')}
                  className="btn-secondary"
                >
                  <span>📈</span>
                  Start Staking
                </button>
              </div>

              <div className="status-indicator">
                <div className="status-dot"></div>
                <span className="status-text">
                  All systems operational
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-icon"></div>
      </div>
    </section>
  );
};

export default ProductionHero;

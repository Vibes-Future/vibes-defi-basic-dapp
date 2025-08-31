'use client';

import React, { useState, useEffect } from 'react';
import { ProductionWalletButton } from '@/features/wallet';

const ProductionHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className={`production-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          {/* Logo */}
          <a href="#" className="production-logo">
            <div className="logo-icon">V</div>
            <div className="logo-text">
              <div className="logo-title">VIBES</div>
              <div className="logo-subtitle">DeFi Ecosystem</div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="production-nav">
            <button 
              onClick={() => scrollToSection('presale')}
              className="nav-link"
            >
              Presale
            </button>
            <button 
              onClick={() => scrollToSection('staking')}
              className="nav-link"
            >
              Staking
            </button>
            <button 
              onClick={() => scrollToSection('vesting')}
              className="nav-link"
            >
              Vesting
            </button>
            

            
            <ProductionWalletButton />
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={(e) => {
          // Close menu when clicking on overlay (not menu content)
          if (e.target === e.currentTarget) {
            setMobileMenuOpen(false);
          }
        }}
      >
        <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
          <nav className="mobile-nav">
            <button 
              onClick={() => scrollToSection('presale')}
              className="mobile-nav-link"
            >
              <span>💰</span>
              <span>Presale</span>
            </button>
            <button 
              onClick={() => scrollToSection('staking')}
              className="mobile-nav-link"
            >
              <span>🥩</span>
              <span>Staking</span>
            </button>
            <button 
              onClick={() => scrollToSection('vesting')}
              className="mobile-nav-link"
            >
              <span>⏰</span>
              <span>Vesting</span>
            </button>
          </nav>
          

          
          {/* Mobile Wallet */}
          <div className="mobile-wallet-container">
            <ProductionWalletButton />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductionHeader;

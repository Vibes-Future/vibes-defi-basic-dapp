'use client';

import React, { useState, useEffect } from 'react';
import { WalletButton } from '../WalletButton';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false); // Close mobile menu after navigation
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-glass backdrop-blur-xl border-b border-white/10 shadow-xl' 
            : 'bg-transparent'
        }`}
      >
        <div className="container">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center sm:w-8 sm:h-8">
                <span className="text-2xl font-bold text-primary-4 sm:text-lg">V</span>
              </div>
              <div className="hidden xs:block sm:block">
                <h1 className="text-gradient text-2xl font-heading font-bold sm:text-xl">VIBES</h1>
                <p className="text-xs text-gray-400 font-medium hidden sm:block">DeFi Ecosystem</p>
              </div>
              {/* Mobile-only shortened text */}
              <div className="block xs:hidden">
                <h1 className="text-gradient text-lg font-heading font-bold">VIBES</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('presale')}
                className="text-white hover:text-primary-1 transition-colors duration-200 font-medium"
              >
                Presale
              </button>
              <button 
                onClick={() => scrollToSection('staking')}
                className="text-white hover:text-primary-1 transition-colors duration-200 font-medium"
              >
                Staking
              </button>
              <button 
                onClick={() => scrollToSection('vesting')}
                className="text-white hover:text-primary-1 transition-colors duration-200 font-medium"
              >
                Vesting
              </button>
            </nav>

            {/* Desktop Wallet & Status */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Network Status */}
              <div className="hidden lg:flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Devnet</span>
              </div>
              <WalletButton />
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center space-x-2">
              {/* Mobile Network Status */}
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400 hidden xs:block">Dev</span>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative z-50 w-8 h-8 flex flex-col justify-center items-center touch-target"
                aria-label="Toggle mobile menu"
              >
                <span className={`w-5 h-0.5 bg-primary-1 transition-all duration-300 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''
                }`} />
                <span className={`w-5 h-0.5 bg-primary-1 transition-all duration-300 mt-1 ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`} />
                <span className={`w-5 h-0.5 bg-primary-1 transition-all duration-300 mt-1 ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
        mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div className={`absolute top-0 left-0 right-0 bg-bg-primary/98 border-b border-primary-1/20 transition-all duration-300 ${
          mobileMenuOpen ? 'translate-y-16' : '-translate-y-full'
        }`}>
          <div className="container py-6">
            {/* Mobile Navigation */}
            <nav className="space-y-1 mb-6">
              <button 
                onClick={() => scrollToSection('presale')}
                className="block w-full text-left text-lg text-gray-300 hover:text-primary-1 hover:bg-primary-1/10 transition-all duration-200 py-3 px-4 rounded-lg touch-target"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💰</span>
                  <span>Presale</span>
                </div>
              </button>
              <button 
                onClick={() => scrollToSection('staking')}
                className="block w-full text-left text-lg text-gray-300 hover:text-primary-1 hover:bg-primary-1/10 transition-all duration-200 py-3 px-4 rounded-lg touch-target"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🥩</span>
                  <span>Staking</span>
                </div>
              </button>
              <button 
                onClick={() => scrollToSection('vesting')}
                className="block w-full text-left text-lg text-gray-300 hover:text-primary-1 hover:bg-primary-1/10 transition-all duration-200 py-3 px-4 rounded-lg touch-target"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">⏰</span>
                  <span>Vesting</span>
                </div>
              </button>
            </nav>

            {/* Mobile Wallet Button */}
            <div className="border-t border-primary-1/20 pt-4">
              <WalletButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
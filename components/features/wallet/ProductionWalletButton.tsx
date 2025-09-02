'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

const ProductionWalletButton: React.FC = () => {
  const { publicKey, connected, connecting, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        disabled={connecting}
        className="wallet-connect-button"
      >
        {connecting ? (
          <>
            <div className="wallet-connect-spinner"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="wallet-icon"
            >
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="wallet-connected-container" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="wallet-connected-button"
      >
        <div className="wallet-status-indicator"></div>
        
        {wallet?.adapter.icon && (
          <img 
            src={wallet.adapter.icon} 
            alt={wallet.adapter.name}
            className="wallet-adapter-icon"
          />
        )}
        
        <span className="wallet-address">
          {formatAddress(publicKey!.toString())}
        </span>
        
        <svg
          className={`wallet-dropdown-arrow ${showDropdown ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {showDropdown && (
        <div className="wallet-dropdown">
          <div className="wallet-dropdown-header">
            <div className="wallet-dropdown-wallet-info">
              {wallet?.adapter.icon && (
                <img 
                  src={wallet.adapter.icon} 
                  alt={wallet.adapter.name}
                  className="wallet-dropdown-icon"
                />
              )}
              <div>
                <div className="wallet-dropdown-name">{wallet?.adapter.name}</div>
                <div className="wallet-dropdown-address">
                  {formatAddress(publicKey!.toString())}
                </div>
              </div>
            </div>
          </div>

          <div className="wallet-dropdown-divider"></div>

          <button
            onClick={handleCopyAddress}
            className="wallet-dropdown-item"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{copied ? 'Copied!' : 'Copy Address'}</span>
          </button>

          <button
            onClick={() => setVisible(true)}
            className="wallet-dropdown-item"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 16L12 12L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.39 18.39C21.3653 17.8583 22.1358 17.0169 22.5799 15.9986C23.0239 14.9804 23.1162 13.8432 22.8422 12.7667C22.5682 11.6901 21.9434 10.7355 21.0667 10.0534C20.1901 9.37139 19.1108 9.00073 18 9.00073H16.74C16.4373 7.82924 15.8731 6.74233 15.0899 5.82099C14.3067 4.89965 13.3248 4.16785 12.2181 3.68061C11.1113 3.19336 9.90851 2.96336 8.70012 3.00788C7.49173 3.05241 6.30907 3.37031 5.24118 3.93766C4.17329 4.50501 3.24791 5.30709 2.53463 6.28358C1.82134 7.26006 1.33866 8.38554 1.12294 9.57539C0.907218 10.7652 0.964019 11.9885 1.28922 13.1533C1.61442 14.3181 2.19997 15.3939 3 16.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Change Wallet</span>
          </button>

          <div className="wallet-dropdown-divider"></div>

          <button
            onClick={handleDisconnect}
            className="wallet-dropdown-item wallet-dropdown-disconnect"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductionWalletButton;

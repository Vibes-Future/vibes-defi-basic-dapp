'use client';

import React from 'react';

interface StatusBannerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-40 mx-4">
      <div className="container">
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h4 className="font-heading font-semibold text-warning mb-2">
                🚧 Development Mode Active
              </h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• <strong>Smart contracts are not initialized yet</strong> - transactions are simulated</p>
                <p>• <strong>Devnet airdrop limit reached</strong> - you may need to wait or use another wallet</p>
                <p>• <strong>Demo mode enabled</strong> - all transactions will show success but won&apos;t be real</p>
                <p>• <strong>UI/UX testing</strong> - perfect for exploring the interface!</p>
              </div>
              <div className="mt-3 p-2 bg-info/10 rounded-lg border border-info/20">
                <p className="text-xs text-info">
                  💡 <strong>Tip:</strong> This is normal for development. All UI features work perfectly - 
                  you can test buying, staking, and vesting flows safely!
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

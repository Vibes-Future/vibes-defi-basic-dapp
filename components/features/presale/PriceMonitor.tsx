'use client';

import React, { useState, useEffect } from 'react';
import { priceService, type PriceData } from '@/lib/priceService';

interface PriceMonitorProps {
  showMonitor?: boolean;
}

/**
 * Professional price monitoring component
 * Shows real-time price data and API health status
 */
const PriceMonitor: React.FC<PriceMonitorProps> = ({ showMonitor = false }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await priceService.getSolPrice();
      setPriceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showMonitor) {
      fetchPrice();
      
      // Refresh every 2 minutes
      const interval = setInterval(fetchPrice, 120000);
      return () => clearInterval(interval);
    }
  }, [showMonitor]);

  if (!showMonitor) return null;

  return (
    <div className="fixed top-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-sm font-mono max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-green-400">Price Monitor</h3>
        <button
          onClick={fetchPrice}
          disabled={loading}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs disabled:opacity-50"
        >
          {loading ? '⏳' : '🔄'}
        </button>
      </div>
      
      {error && (
        <div className="mb-2 p-2 bg-red-900 border border-red-700 rounded text-red-300 text-xs">
          ❌ {error}
        </div>
      )}
      
      {priceData && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-blue-300">Price:</span>
            <span className="text-green-400 font-bold">${priceData.price.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-blue-300">Source:</span>
            <span className={priceData.source === 'fallback' ? 'text-yellow-400' : 'text-green-400'}>
              {priceData.source}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-blue-300">Cached:</span>
            <span className={priceData.cached ? 'text-yellow-400' : 'text-green-400'}>
              {priceData.cached ? '✅' : '❌'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-blue-300">Time:</span>
            <span className="text-gray-300 text-xs">
              {new Date(priceData.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          Cache Status: {priceService.getCacheStatus().length} entries
        </div>
      </div>
    </div>
  );
};

export default PriceMonitor;

/**
 * Professional Price Service
 * Handles price fetching with caching, rate limiting, and fallbacks
 */

interface PriceData {
  price: number;
  source: string;
  timestamp: string;
  cached: boolean;
}

interface PriceCache {
  data: PriceData;
  expiry: number;
}

class PriceService {
  private cache: Map<string, PriceCache> = new Map();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  private readonly FALLBACK_PRICES = {
    SOL: 180,
    BTC: 45000,
    ETH: 2500
  };

  /**
   * Get SOL price with caching and fallbacks
   */
  async getSolPrice(): Promise<PriceData> {
    const cacheKey = 'SOL_USD';
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return { ...cached.data, cached: true };
    }

    try {
      const response = await fetch('/api/sol-price', {
        next: { revalidate: 120 }, // Next.js cache
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
        }
      });

      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }

      const result = await response.json();
      
      const priceData: PriceData = {
        price: result.solana.usd,
        source: result.metadata?.source || 'unknown',
        timestamp: result.metadata?.timestamp || new Date().toISOString(),
        cached: false
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: priceData,
        expiry: Date.now() + this.CACHE_DURATION
      });

      return priceData;
    } catch (error) {
      console.error('Price service error:', error);
      
      // Return cached data if available (even if expired)
      if (cached) {
        console.warn('Using expired cache due to API failure');
        return { ...cached.data, cached: true };
      }

      // Ultimate fallback
      return {
        price: this.FALLBACK_PRICES.SOL,
        source: 'fallback',
        timestamp: new Date().toISOString(),
        cached: false
      };
    }
  }

  /**
   * Clear cache manually if needed
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): { key: string; expiry: number; expired: boolean }[] {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([key, cache]) => ({
      key,
      expiry: cache.expiry,
      expired: now > cache.expiry
    }));
  }
}

// Singleton instance
export const priceService = new PriceService();

// Legacy function for backwards compatibility
export async function getSolPrice(): Promise<number> {
  const priceData = await priceService.getSolPrice();
  return priceData.price;
}

export type { PriceData };
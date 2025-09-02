/**
 * Price service for fetching real-time SOL/USD prices
 */

export interface PriceData {
  solUsd: number;
  timestamp: number;
}

export class PriceService {
  private static cache: PriceData | null = null;
  private static CACHE_DURATION = 60000; // 1 minute cache

  /**
   * Get SOL/USD price from multiple sources with fallback
   */
  static async getSolUsdPrice(): Promise<number> {
    // Check cache first
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.solUsd;
    }

    try {
      // Try CoinGecko API first
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      if (response.ok) {
        const data = await response.json();
        const price = data.solana?.usd;
        if (price && typeof price === 'number') {
          this.cache = { solUsd: price, timestamp: Date.now() };
          return price;
        }
      }
    } catch (error) {
      console.warn('CoinGecko API failed, using fallback price:', error);
    }

    try {
      // Fallback to CoinCap API
      const response = await fetch('https://api.coincap.io/v2/assets/solana');
      if (response.ok) {
        const data = await response.json();
        const price = parseFloat(data.data?.priceUsd || '0');
        if (price > 0) {
          this.cache = { solUsd: price, timestamp: Date.now() };
          return price;
        }
      }
    } catch (error) {
      console.warn('CoinCap API failed, using default price:', error);
    }

    // Final fallback to a reasonable default
    const fallbackPrice = 100; // Conservative SOL price in USD
    console.warn('All price APIs failed, using fallback price:', fallbackPrice);
    return fallbackPrice;
  }

  /**
   * Clear price cache (useful for testing)
   */
  static clearCache(): void {
    this.cache = null;
  }
}

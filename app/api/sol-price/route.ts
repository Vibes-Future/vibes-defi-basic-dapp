import { NextRequest, NextResponse } from 'next/server';

// Professional price caching system
interface PriceCache {
  price: number;
  timestamp: number;
  source: string;
}

// In-memory cache with 2-minute TTL
const priceCache: Map<string, PriceCache> = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const RATE_LIMIT_DELAY = 1000; // 1 second between requests

// Rate limiting tracker
let lastRequestTime = 0;

// Multiple price sources for redundancy
const PRICE_SOURCES = [
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
    parser: (data: any) => data.solana.usd,
    headers: { 'User-Agent': 'VIBES-DeFi-App/1.0' }
  },
  {
    name: 'Jupiter',
    url: 'https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112',
    parser: (data: any) => data.data?.['So11111111111111111111111111111111111111112']?.price,
    headers: {}
  }
];

async function fetchPriceFromSource(source: typeof PRICE_SOURCES[0]): Promise<number | null> {
  try {
    const response = await fetch(source.url, {
      headers: source.headers,
      next: { revalidate: 60 } // Cache for 1 minute at CDN level
    });

    if (!response.ok) {
      throw new Error(`${source.name} API error: ${response.status}`);
    }

    const data = await response.json();
    const price = source.parser(data);
    
    if (typeof price === 'number' && price > 0) {
      return price;
    }
    
    throw new Error(`Invalid price data from ${source.name}`);
  } catch (error) {
    console.warn(`Failed to fetch from ${source.name}:`, error);
    return null;
  }
}

async function getSolPrice(): Promise<{ price: number; source: string }> {
  // Check cache first
  const cached = priceCache.get('SOL');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { price: cached.price, source: `${cached.source} (cached)` };
  }

  // Rate limiting
  const now = Date.now();
  if (now - lastRequestTime < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - (now - lastRequestTime);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();

  // Try each price source in order
  for (const source of PRICE_SOURCES) {
    const price = await fetchPriceFromSource(source);
    if (price) {
      // Cache successful result
      priceCache.set('SOL', {
        price,
        timestamp: Date.now(),
        source: source.name
      });
      return { price, source: source.name };
    }
  }

  // If all sources fail, use cached data if available (even if stale)
  if (cached) {
    console.warn('All price sources failed, using stale cache');
    return { price: cached.price, source: `${cached.source} (stale cache)` };
  }

  // Ultimate fallback
  throw new Error('All price sources failed and no cache available');
}

export async function GET(request: NextRequest) {
  try {
    const { price, source } = await getSolPrice();
    
    return NextResponse.json({
      solana: { usd: price },
      metadata: {
        source,
        timestamp: new Date().toISOString(),
        cached: source.includes('cached')
      }
    });
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    
    // Professional fallback with reasonable market price
    const fallbackPrice = 180; // Conservative SOL price fallback
    
    return NextResponse.json({
      solana: { usd: fallbackPrice },
      metadata: {
        source: 'fallback',
        timestamp: new Date().toISOString(),
        error: 'All price sources unavailable'
      }
    });
  }
}

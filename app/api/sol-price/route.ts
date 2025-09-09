import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch SOL price from CoinGecko API
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
      headers: {
        'User-Agent': 'VIBES-DeFi-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the SOL price
    return NextResponse.json({
      solana: {
        usd: data.solana.usd
      }
    });
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    
    // Return fallback price if API fails
    return NextResponse.json({
      solana: {
        usd: 200 // Fallback price
      }
    }, { status: 200 }); // Still return 200 so frontend doesn't fail
  }
}

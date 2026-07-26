import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET() {
  try {
    const symbols = ['INR=X', 'EUR=X', 'GBP=X'];
    const quotes = await yahooFinance.quote(symbols);
    
    const rates: Record<string, number> = {
      USD: 1, // base currency
    };

    quotes.forEach(quote => {
      if (quote.currency && quote.regularMarketPrice) {
        rates[quote.currency] = quote.regularMarketPrice;
      }
    });

    // Fallbacks just in case the API misses something
    if (!rates['INR']) rates['INR'] = 96.56;
    if (!rates['EUR']) rates['EUR'] = 0.88;
    if (!rates['GBP']) rates['GBP'] = 0.75;

    return NextResponse.json(rates);
  } catch (error: any) {
    console.error('Error fetching exchange rates from Yahoo Finance:', error);
    // Return mock fallbacks if API fails
    return NextResponse.json({
      USD: 1,
      INR: 96.56,
      EUR: 0.88,
      GBP: 0.75
    });
  }
}

import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();
const rateCache = new Map<string, { rate: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getExchangeRateToUSD(currency: string): Promise<number> {
  if (!currency || currency === 'USD') return 1;

  const now = Date.now();
  const cached = rateCache.get(currency);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.rate;
  }

  try {
    const symbol = `${currency}=X`;
    const quote = await yahooFinance.quote(symbol);
    
    if (quote && quote.regularMarketPrice) {
      const rate = quote.regularMarketPrice;
      rateCache.set(currency, { rate, timestamp: now });
      return rate;
    }
  } catch (error) {
    console.error(`Failed to fetch exchange rate for ${currency}:`, error);
  }

  // Fallbacks if API fails
  const fallbacks: Record<string, number> = {
    INR: 96.56,
    EUR: 0.88,
    GBP: 0.75,
  };

  return fallbacks[currency] || 1;
}

/**
 * Normalizes a price from its native currency to USD.
 * Since e.g. INR=X is 83 (meaning 1 USD = 83 INR), we divide by the rate.
 */
export async function normalizeToUSD(price: number, currency: string): Promise<number> {
  if (!currency || currency === 'USD' || !price) return price;
  const rateToUSD = await getExchangeRateToUSD(currency);
  return price / rateToUSD;
}

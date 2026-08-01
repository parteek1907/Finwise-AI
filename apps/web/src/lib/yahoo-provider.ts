/**
 * Yahoo Finance Provider — Abstraction Layer
 * 
 * All Yahoo Finance API interactions go through this provider.
 * Structured so it can be swapped for Finnhub, Polygon, Twelve Data, etc.
 * 
 * This file runs SERVER-SIDE ONLY (Next.js API routes).
 */

import YahooFinance from 'yahoo-finance2';
import type { MarketPhase, MarketStatusDetails } from '@/types/market';

// ─── Provider Interface ─────────────────────────────────────────────────────
// Any future provider (Finnhub, Polygon, Alpha Vantage) must implement this.

export interface ProviderQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  exchange: string;
  currency: string;
  marketState?: string; // 'REGULAR', 'PRE', 'POST', 'CLOSED'
  regularMarketTime?: number;
  exchangeTimezoneShortName?: string;
  exchangeTimezoneName?: string;
}

export interface ProviderCandle {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketProvider {
  getQuote(symbol: string): Promise<ProviderQuote>;
  getBatchQuotes(symbols: string[]): Promise<ProviderQuote[]>;
  getCandles(symbol: string, timeframe: string): Promise<ProviderCandle[]>;
  getExchangeRates(): Promise<Record<string, number>>;
  searchSymbols(query: string): Promise<Array<{ symbol: string; name: string; exchange: string; type: string }>>;
}

// ─── Server-side Cache ──────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const quoteCache = new Map<string, CacheEntry<ProviderQuote>>();
const candleCache = new Map<string, CacheEntry<ProviderCandle[]>>();
const exchangeRateCache: CacheEntry<Record<string, number>> | null = { data: {}, timestamp: 0 };
let exchangeRateCacheRef = exchangeRateCache;

const QUOTE_CACHE_TTL_OPEN = 15 * 1000;      // 15s during market hours
const QUOTE_CACHE_TTL_CLOSED = 5 * 60 * 1000; // 5min when market closed
const CANDLE_CACHE_TTL = 5 * 60 * 1000;        // 5min
const EXCHANGE_RATE_CACHE_TTL = 15 * 60 * 1000; // 15min

function isCacheValid<T>(entry: CacheEntry<T> | undefined | null, ttl: number): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttl;
}

// ─── Yahoo Finance Provider Implementation ──────────────────────────────────

const yahooFinance = new YahooFinance();

export class YahooFinanceProvider implements MarketProvider {

  async getQuote(symbol: string): Promise<ProviderQuote> {
    // Check cache
    const cached = quoteCache.get(symbol);
    const ttl = this.isLikelyMarketOpen(symbol) ? QUOTE_CACHE_TTL_OPEN : QUOTE_CACHE_TTL_CLOSED;
    if (isCacheValid(cached, ttl)) {
      return cached!.data;
    }

    try {
      const quote = await yahooFinance.quote(symbol);

      if (!quote || !quote.regularMarketPrice) {
        throw new Error(`No data returned for symbol: ${symbol}`);
      }

      const result: ProviderQuote = {
        symbol: quote.symbol || symbol,
        name: quote.shortName || quote.longName || symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        high: quote.regularMarketDayHigh || quote.regularMarketPrice,
        low: quote.regularMarketDayLow || quote.regularMarketPrice,
        open: quote.regularMarketOpen || quote.regularMarketPrice,
        previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0,
        exchange: quote.fullExchangeName || quote.exchange || 'MARKET',
        currency: quote.currency || 'USD',
        marketState: quote.marketState as string | undefined,
        regularMarketTime: quote.regularMarketTime
          ? (typeof quote.regularMarketTime === 'object' && 'getTime' in quote.regularMarketTime
              ? Math.floor((quote.regularMarketTime as Date).getTime() / 1000)
              : quote.regularMarketTime as number)
          : undefined,
        exchangeTimezoneShortName: (quote as any).exchangeTimezoneShortName,
        exchangeTimezoneName: (quote as any).exchangeTimezoneName,
      };

      // Update cache
      quoteCache.set(symbol, { data: result, timestamp: Date.now() });
      return result;

    } catch (error: any) {
      // Return last cached value if available (graceful degradation)
      if (cached) {
        console.warn(`Yahoo API failed for ${symbol}, returning cached data:`, error.message);
        return cached.data;
      }
      throw error;
    }
  }

  async getBatchQuotes(symbols: string[]): Promise<ProviderQuote[]> {
    // Check which symbols need a fresh fetch
    const results: ProviderQuote[] = [];
    const symbolsToFetch: string[] = [];

    for (const sym of symbols) {
      const cached = quoteCache.get(sym);
      const ttl = this.isLikelyMarketOpen(sym) ? QUOTE_CACHE_TTL_OPEN : QUOTE_CACHE_TTL_CLOSED;
      if (isCacheValid(cached, ttl)) {
        results.push(cached!.data);
      } else {
        symbolsToFetch.push(sym);
      }
    }

    if (symbolsToFetch.length > 0) {
      try {
        // yahoo-finance2's quote() accepts an array
        const quotes = await yahooFinance.quote(symbolsToFetch);
        const quoteArray = Array.isArray(quotes) ? quotes : [quotes];

        for (const quote of quoteArray) {
          if (!quote || !quote.regularMarketPrice) continue;

          const result: ProviderQuote = {
            symbol: quote.symbol || '',
            name: quote.shortName || quote.longName || quote.symbol || '',
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            high: quote.regularMarketDayHigh || quote.regularMarketPrice,
            low: quote.regularMarketDayLow || quote.regularMarketPrice,
            open: quote.regularMarketOpen || quote.regularMarketPrice,
            previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
            volume: quote.regularMarketVolume || 0,
            marketCap: quote.marketCap || 0,
            exchange: quote.fullExchangeName || quote.exchange || 'MARKET',
            currency: quote.currency || 'USD',
            marketState: quote.marketState as string | undefined,
            regularMarketTime: quote.regularMarketTime
              ? (typeof quote.regularMarketTime === 'object' && 'getTime' in quote.regularMarketTime
                  ? Math.floor((quote.regularMarketTime as Date).getTime() / 1000)
                  : quote.regularMarketTime as number)
              : undefined,
            exchangeTimezoneShortName: (quote as any).exchangeTimezoneShortName,
            exchangeTimezoneName: (quote as any).exchangeTimezoneName,
          };

          quoteCache.set(result.symbol, { data: result, timestamp: Date.now() });
          results.push(result);
        }
      } catch (error: any) {
        console.error('Batch quote fetch failed:', error.message);
        // Return any cached data for the failed symbols
        for (const sym of symbolsToFetch) {
          const cached = quoteCache.get(sym);
          if (cached) results.push(cached.data);
        }
      }
    }

    return results;
  }

  async getCandles(symbol: string, timeframe: string): Promise<ProviderCandle[]> {
    const cacheKey = `${symbol}:${timeframe}`;
    const cached = candleCache.get(cacheKey);
    if (isCacheValid(cached, CANDLE_CACHE_TTL)) {
      return cached!.data;
    }

    try {
      let interval: "1m" | "2m" | "5m" | "15m" | "30m" | "60m" | "90m" | "1h" | "1d" | "5d" | "1wk" | "1mo" | "3mo" = '1d';
      const now = new Date();
      const period1 = new Date();

      switch (timeframe) {
        case '1D':
          interval = '5m';
          period1.setDate(now.getDate() - 1);
          break;
        case '5D':
          interval = '15m';
          period1.setDate(now.getDate() - 5);
          break;
        case '1M':
          interval = '1d';
          period1.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          interval = '1d';
          period1.setMonth(now.getMonth() - 3);
          break;
        case '6M':
          interval = '1d';
          period1.setMonth(now.getMonth() - 6);
          break;
        case '1Y':
          interval = '1d';
          period1.setFullYear(now.getFullYear() - 1);
          break;
        case 'ALL':
          interval = '1mo';
          period1.setFullYear(now.getFullYear() - 5);
          break;
      }

      const chart = await yahooFinance.chart(symbol, { period1, interval });

      if (!chart || !chart.quotes || chart.quotes.length === 0) {
        return [];
      }

      const candles: ProviderCandle[] = chart.quotes
        .filter((q: any) => q.open !== null && q.close !== null)
        .map((q: any) => ({
          time: ((interval as string) === '1d' || (interval as string) === '1wk' || (interval as string) === '1mo')
            ? q.date.toISOString().split('T')[0]
            : Math.floor(q.date.getTime() / 1000),
          open: q.open,
          high: q.high,
          low: q.low,
          close: q.close,
          volume: q.volume || 0,
        }));

      candleCache.set(cacheKey, { data: candles, timestamp: Date.now() });
      return candles;

    } catch (error: any) {
      // Return cached data if available
      if (cached) {
        console.warn(`Candle fetch failed for ${symbol}, returning cached:`, error.message);
        return cached.data;
      }
      throw error;
    }
  }

  async getExchangeRates(): Promise<Record<string, number>> {
    if (isCacheValid(exchangeRateCacheRef, EXCHANGE_RATE_CACHE_TTL)) {
      return exchangeRateCacheRef!.data;
    }

    try {
      const symbols = ['INR=X', 'EUR=X', 'GBP=X'];
      const quotes = await yahooFinance.quote(symbols);
      const quotesArray = Array.isArray(quotes) ? quotes : [quotes];

      const rates: Record<string, number> = { USD: 1 };

      quotesArray.forEach((quote: any) => {
        if (quote.currency && quote.regularMarketPrice) {
          rates[quote.currency] = quote.regularMarketPrice;
        }
      });

      // Fallbacks
      if (!rates['INR']) rates['INR'] = 96.56;
      if (!rates['EUR']) rates['EUR'] = 0.88;
      if (!rates['GBP']) rates['GBP'] = 0.75;

      exchangeRateCacheRef = { data: rates, timestamp: Date.now() };
      return rates;

    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      if (exchangeRateCacheRef && exchangeRateCacheRef.data && Object.keys(exchangeRateCacheRef.data).length > 0) {
        return exchangeRateCacheRef.data;
      }
      return { USD: 1, INR: 96.56, EUR: 0.88, GBP: 0.75 };
    }
  }

  async searchSymbols(query: string): Promise<Array<{ symbol: string; name: string; exchange: string; type: string }>> {
    try {
      const result = await yahooFinance.search(query, { quotesCount: 10 });
      return (result.quotes || []).map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || q.exchange || 'MARKET',
        type: q.quoteType === 'EQUITY' ? 'Stock' : q.quoteType === 'CRYPTOCURRENCY' ? 'Crypto' : q.quoteType === 'ETF' ? 'ETF' : 'Stock',
      }));
    } catch (error) {
      console.error('Symbol search failed:', error);
      return [];
    }
  }

  // ─── Market Status ──────────────────────────────────────────────────────

  getMarketStatus(providerQuote?: ProviderQuote): MarketStatusDetails {
    // If we have a Yahoo quote with marketState, use it
    if (providerQuote?.marketState) {
      const state = providerQuote.marketState;
      const tz = providerQuote.exchangeTimezoneShortName || 'EST';

      if (state === 'REGULAR') {
        return { isOpen: true, phase: 'Market Open', displayMessage: 'Market Open' };
      }
      if (state === 'PRE') {
        return { isOpen: false, phase: 'Pre-Market', displayMessage: `Pre-Market • ${tz}` };
      }
      if (state === 'POST' || state === 'POSTPOST') {
        return { isOpen: false, phase: 'After Hours', displayMessage: `After Hours • ${tz}` };
      }
      // CLOSED or PREPRE or unknown
      return this.computeClosedStatus(providerQuote);
    }

    // Fallback: compute from time
    return this.computeClosedStatusFromTime();
  }

  private computeClosedStatus(quote: ProviderQuote): MarketStatusDetails {
    const exchange = quote.exchange || '';
    const tz = quote.exchangeTimezoneName || 'America/New_York';
    const tzShort = quote.exchangeTimezoneShortName || 'EST';

    const now = new Date();
    const dayOfWeek = this.getDayInTimezone(now, tz);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      const nextOpen = this.getNextOpenDate(now, tz, exchange);
      return {
        isOpen: false,
        phase: 'Weekend',
        nextOpenTime: nextOpen.toISOString(),
        displayMessage: `Weekend • Opens ${this.formatNextOpenMessage(nextOpen, tz, tzShort)}`,
      };
    }

    const nextOpen = this.getNextOpenDate(now, tz, exchange);
    return {
      isOpen: false,
      phase: 'Market Closed',
      nextOpenTime: nextOpen.toISOString(),
      displayMessage: `Market Closed • Opens ${this.formatNextOpenMessage(nextOpen, tz, tzShort)}`,
    };
  }

  private computeClosedStatusFromTime(): MarketStatusDetails {
    const now = new Date();
    const estStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
    const estDate = new Date(estStr);
    const day = estDate.getDay();
    const hours = estDate.getHours();
    const minutes = estDate.getMinutes();

    const isWeekend = day === 0 || day === 6;
    const isOpen = !isWeekend && ((hours > 9 || (hours === 9 && minutes >= 30)) && hours < 16);

    if (isOpen) {
      return { isOpen: true, phase: 'Market Open', displayMessage: 'Market Open' };
    }

    const phase: MarketPhase = isWeekend ? 'Weekend' : 'Market Closed';
    return {
      isOpen: false,
      phase,
      displayMessage: `${phase}`,
    };
  }

  private getDayInTimezone(date: Date, timezone: string): number {
    try {
      const str = date.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short' });
      const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return dayMap[str] ?? date.getDay();
    } catch {
      return date.getDay();
    }
  }

  private getNextOpenDate(now: Date, timezone: string, exchange: string): Date {
    const isIndian = exchange.toUpperCase().includes('NSE') || exchange.toUpperCase().includes('BSE');
    const openHour = isIndian ? 9 : 9;
    const openMinute = isIndian ? 15 : 30;

    const nextOpen = new Date(now);
    const day = this.getDayInTimezone(now, timezone);

    if (day === 5) nextOpen.setDate(nextOpen.getDate() + 3);
    else if (day === 6) nextOpen.setDate(nextOpen.getDate() + 2);
    else nextOpen.setDate(nextOpen.getDate() + 1);

    // Set approximate open time
    nextOpen.setHours(openHour, openMinute, 0, 0);
    return nextOpen;
  }

  private formatNextOpenMessage(nextOpen: Date, tz: string, tzShort: string): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    try {
      const dayName = days[nextOpen.getDay()];
      const timeStr = nextOpen.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `${dayName} • ${timeStr} ${tzShort}`;
    } catch {
      return `${tzShort}`;
    }
  }

  // Simple heuristic: crypto is always open, US is open 9:30-4 EST weekdays
  private isLikelyMarketOpen(symbol: string): boolean {
    const s = symbol.toUpperCase();
    if (s.includes('BTC') || s.includes('ETH') || s.includes('SOL') || s.includes('DOGE')) return true;
    // Check cached quote marketState
    const cached = quoteCache.get(symbol);
    if (cached?.data.marketState === 'REGULAR') return true;
    return false;
  }
}

// ─── Singleton Export ───────────────────────────────────────────────────────
// All API routes use this single instance to share caches.

export const yahooProvider = new YahooFinanceProvider();

/**
 * Core Currency Service
 *
 * Provides a single, uniform way to convert monetary values between currencies.
 * Ensures we never convert a currency to itself and always use standard rates.
 */

import { CURRENCY_MAP } from '../utils/formatters';
import { Quote, Candle, MarketMover } from '../types/market';

export class CurrencyService {
  /**
   * Safely converts a monetary value from one currency to another.
   * If both currencies are the same, it returns the raw price (avoiding duplicate conversions).
   * It uses USD as the base currency if needed.
   *
   * @param price The native raw price.
   * @param fromCurrency The native currency (e.g. 'INR', 'USD').
   * @param toCurrency The target user currency (e.g. 'INR', 'USD').
   * @param rates A dictionary of exchange rates relative to USD.
   */
  static convert(
    price: number | undefined | null,
    fromCurrency: string,
    toCurrency: string,
    rates: Record<string, number>
  ): number {
    if (price === undefined || price === null) return 0;
    if (fromCurrency === toCurrency) return price;

    const getRate = (code: string) => rates[code] || CURRENCY_MAP[code]?.rate || 1;
    
    const fromRate = getRate(fromCurrency);
    const toRate = getRate(toCurrency);

    // Convert from native -> USD -> target
    const amountInUSD = price / fromRate;
    return amountInUSD * toRate;
  }

  /**
   * Converts a Quote object into the target currency.
   */
  static convertQuote(
    quote: Quote,
    targetCurrency: string,
    rates: Record<string, number>
  ): Quote {
    const fromCurrency = quote.currency || 'USD';
    
    // If it's already in the target currency, just ensure the field is set and return
    if (fromCurrency === targetCurrency) {
      return { ...quote, currency: targetCurrency };
    }

    return {
      ...quote,
      currency: targetCurrency,
      price: this.convert(quote.price, fromCurrency, targetCurrency, rates),
      change: this.convert(quote.change, fromCurrency, targetCurrency, rates),
      previousClose: quote.previousClose ? this.convert(quote.previousClose, fromCurrency, targetCurrency, rates) : undefined,
      high: quote.high ? this.convert(quote.high, fromCurrency, targetCurrency, rates) : undefined,
      low: quote.low ? this.convert(quote.low, fromCurrency, targetCurrency, rates) : undefined,
      open: quote.open ? this.convert(quote.open, fromCurrency, targetCurrency, rates) : undefined,
      marketCap: quote.marketCap ? this.convert(quote.marketCap, fromCurrency, targetCurrency, rates) : (undefined as any),
    };
  }

  /**
   * Converts an array of Candles into the target currency.
   */
  static convertCandles(
    candles: Candle[],
    fromCurrency: string,
    targetCurrency: string,
    rates: Record<string, number>
  ): Candle[] {
    if (fromCurrency === targetCurrency) return candles;

    return candles.map(candle => ({
      ...candle,
      open: this.convert(candle.open, fromCurrency, targetCurrency, rates),
      high: this.convert(candle.high, fromCurrency, targetCurrency, rates),
      low: this.convert(candle.low, fromCurrency, targetCurrency, rates),
      close: this.convert(candle.close, fromCurrency, targetCurrency, rates),
    }));
  }

  /**
   * Converts a MarketMover into the target currency.
   */
  static convertMover(
    mover: MarketMover,
    fromCurrency: string,
    targetCurrency: string,
    rates: Record<string, number>
  ): MarketMover {
    if (fromCurrency === targetCurrency) return mover;

    return {
      ...mover,
      price: this.convert(mover.price, fromCurrency, targetCurrency, rates)
    };
  }
}

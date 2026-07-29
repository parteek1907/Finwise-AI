import { useSettingsStore } from '@/store/useSettingsStore';

export const CURRENCY_MAP: Record<string, { symbol: string; rate: number; locale: string }> = {
  USD: { symbol: '$', rate: 1, locale: 'en-US' },
  INR: { symbol: '₹', rate: 96.56, locale: 'en-IN' },
  EUR: { symbol: '€', rate: 0.88, locale: 'de-DE' },
  GBP: { symbol: '£', rate: 0.75, locale: 'en-GB' },
};

export const formatCurrency = (
  value: number,
  overrideCurrency?: 'USD' | 'INR' | 'EUR' | 'GBP',
  minFractions: number = 0,
  maxFractions: number = 2
) => {
  let code = overrideCurrency;
  let exchangeRates: Record<string, number> | undefined;
  if (!code) {
    try {
      const financial = useSettingsStore.getState().financial;
      code = financial?.preferredCurrency || 'USD';
      exchangeRates = financial?.exchangeRates;
    } catch {
      code = 'USD';
    }
  } else {
    try {
      exchangeRates = useSettingsStore.getState().financial?.exchangeRates;
    } catch {
      // ignore
    }
  }

  const config = CURRENCY_MAP[code] || CURRENCY_MAP.USD;
  const activeRate = exchangeRates ? (exchangeRates[code] || config.rate) : config.rate;
  const converted = value * activeRate;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: minFractions,
    maximumFractionDigits: maxFractions,
  }).format(converted);
};

/**
 * Format a value in a specific currency WITHOUT exchange-rate conversion.
 * Used for goals that store amounts in the user's currency at creation time.
 */
export const formatCurrencyRaw = (
  value: number,
  currencyCode: string = 'USD',
  minFractions: number = 0,
  maxFractions: number = 0
) => {
  const config = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.USD;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: minFractions,
    maximumFractionDigits: maxFractions,
  }).format(value);
};

/**
 * Get the currency symbol for a given currency code.
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
  if (!currencyCode) {
    try {
      currencyCode = useSettingsStore.getState().financial?.preferredCurrency || 'USD';
    } catch {
      currencyCode = 'USD';
    }
  }
  return CURRENCY_MAP[currencyCode]?.symbol || '$';
};

export const formatPercentage = (value: number, includeSign: boolean = true) => {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatNumber = (value: number) => {
  if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T';
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
  return value.toString();
};

export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString));
};

/**
 * Format a date as relative time (e.g., "Today", "2 days ago", "Jul 14")
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

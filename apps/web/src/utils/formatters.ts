import { useSettingsStore } from '@/store/useSettingsStore';

export const CURRENCY_MAP: Record<string, { symbol: string; rate: number; locale: string }> = {
  USD: { symbol: '$', rate: 1, locale: 'en-US' },
  INR: { symbol: '₹', rate: 96, locale: 'en-IN' },
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
  if (!code) {
    try {
      const financial = useSettingsStore.getState().financial;
      code = financial?.preferredCurrency || 'USD';
    } catch {
      code = 'USD';
    }
  }

  const config = CURRENCY_MAP[code] || CURRENCY_MAP.USD;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: minFractions,
    maximumFractionDigits: maxFractions,
  }).format(value);
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

export const formatDate = (dateInput: string | Date | number) => {
  const d = new Date(dateInput);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format a date as relative time (e.g., "Today", "2 days ago", "14/07/2026")
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
  
  return formatDate(date);
};

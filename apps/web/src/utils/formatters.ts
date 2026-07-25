import { useSettingsStore } from '@/store/useSettingsStore';

const CURRENCY_MAP: Record<string, { symbol: string; rate: number; locale: string }> = {
  USD: { symbol: '$', rate: 1, locale: 'en-US' },
  INR: { symbol: '₹', rate: 83, locale: 'en-IN' },
  EUR: { symbol: '€', rate: 0.92, locale: 'de-DE' },
  GBP: { symbol: '£', rate: 0.79, locale: 'en-GB' },
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
      code = useSettingsStore.getState().financial?.preferredCurrency || 'USD';
    } catch {
      code = 'USD';
    }
  }

  const config = CURRENCY_MAP[code] || CURRENCY_MAP.USD;
  const converted = value * config.rate;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: minFractions,
    maximumFractionDigits: maxFractions,
  }).format(converted);
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

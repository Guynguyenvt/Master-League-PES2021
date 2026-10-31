export type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'VND';

export interface CurrencyConfig {
  code: CurrencyType;
  symbol: string;
  name: string;
  position: 'prefix' | 'suffix';
  multiplier: number;
}

export const CURRENCY_CONFIGS: Record<CurrencyType, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Đô La Mỹ ($)',
    position: 'prefix',
    multiplier: 1.08,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (€)',
    position: 'prefix',
    multiplier: 1.0,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'Bảng Anh (£)',
    position: 'prefix',
    multiplier: 0.85,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Yên Nhật (¥)',
    position: 'prefix',
    multiplier: 160.0,
  },
  VND: {
    code: 'VND',
    symbol: '₫',
    name: 'Đồng (₫)',
    position: 'suffix',
    multiplier: 27000.0,
  },
};

/**
 * Formats a number into a full formatted currency string with commas and currency symbol.
 * Example: amount = 6000000, currency = '$' -> '$6,000,000'
 * Example: amount = 6000000, currency = '€' -> '€6,000,000'
 * Example: amount = 6000000, currency = '₫' -> '6,000,000 ₫'
 */
export function formatFullCurrency(
  amount: number,
  currencyTypeOrSymbol: CurrencyType | string = 'USD',
  options?: {
    showPlusSign?: boolean;
    position?: 'prefix' | 'suffix';
    isRawFullNumber?: boolean;
  }
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }

  // Resolve symbol and position
  let symbol = '$';
  let isPrefix = true;

  if (CURRENCY_CONFIGS[currencyTypeOrSymbol as CurrencyType]) {
    const cfg = CURRENCY_CONFIGS[currencyTypeOrSymbol as CurrencyType];
    symbol = cfg.symbol;
    isPrefix = cfg.position === 'prefix';
  } else if (typeof currencyTypeOrSymbol === 'string') {
    symbol = currencyTypeOrSymbol;
    isPrefix = symbol !== '₫';
  }

  if (options?.position) {
    isPrefix = options.position === 'prefix';
  }

  // Determine full amount:
  // If isRawFullNumber is specified, respect it.
  // Otherwise, if Math.abs(amount) is between 0 and 10000 (legacy small values like 110 or 320.5), convert from millions.
  // If amount >= 10000 (e.g. 6000000), it's already full numbers.
  let fullAmount: number;
  if (options?.isRawFullNumber !== undefined) {
    fullAmount = options.isRawFullNumber ? amount : Math.round(amount * 1_000_000);
  } else if (Math.abs(amount) > 0 && Math.abs(amount) < 10000) {
    fullAmount = Math.round(amount * 1_000_000);
  } else {
    fullAmount = Math.round(amount);
  }

  const isNegative = fullAmount < 0;
  const absAmount = Math.abs(fullAmount);
  const formattedNumber = absAmount.toLocaleString('en-US');

  let sign = '';
  if (isNegative) {
    sign = '-';
  } else if (options?.showPlusSign && fullAmount > 0) {
    sign = '+';
  }

  if (isPrefix) {
    return `${sign}${symbol}${formattedNumber}`;
  } else {
    return `${sign}${formattedNumber} ${symbol}`;
  }
}

/**
 * Formats profit/loss string with explicit +/- sign
 * Example: 6000000 -> '+$6,000,000'
 */
export function formatProfitFull(
  profit: number,
  currencyTypeOrSymbol: CurrencyType | string = 'USD'
): string {
  return formatFullCurrency(profit, currencyTypeOrSymbol, { showPlusSign: true });
}


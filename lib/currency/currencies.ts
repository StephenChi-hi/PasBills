// Major currencies with conversion rates to USD
// Exchange rates are approximate and should be updated regularly in production
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
  rateToUSD: number; // 1 USD = X currency
}

export const CURRENCIES: Record<string, Currency> = {
  // African Countries
  NGN: {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    country: "Nigeria",
    rateToUSD: 1550, // 1 USD = 1550 NGN (approximate)
  },
  ZAR: {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    country: "South Africa",
    rateToUSD: 18.5,
  },
  GHS: {
    code: "GHS",
    symbol: "₵",
    name: "Ghanaian Cedi",
    country: "Ghana",
    rateToUSD: 12.5,
  },
  KES: {
    code: "KES",
    symbol: "KSh",
    name: "Kenyan Shilling",
    country: "Kenya",
    rateToUSD: 155,
  },
  EGP: {
    code: "EGP",
    symbol: "E£",
    name: "Egyptian Pound",
    country: "Egypt",
    rateToUSD: 35,
  },
  UGX: {
    code: "UGX",
    symbol: "USh",
    name: "Ugandan Shilling",
    country: "Uganda",
    rateToUSD: 3850,
  },
  ETB: {
    code: "ETB",
    symbol: "Br",
    name: "Ethiopian Birr",
    country: "Ethiopia",
    rateToUSD: 85,
  },
  TZS: {
    code: "TZS",
    symbol: "TSh",
    name: "Tanzanian Shilling",
    country: "Tanzania",
    rateToUSD: 2650,
  },
  RWF: {
    code: "RWF",
    symbol: "FRw",
    name: "Rwandan Franc",
    country: "Rwanda",
    rateToUSD: 1350,
  },
  CFA: {
    code: "CFA",
    symbol: "Fr",
    name: "CFA Franc",
    country: "West & Central Africa",
    rateToUSD: 610,
  },

  // Major Global Currencies
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    country: "United States",
    rateToUSD: 1,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    country: "European Union",
    rateToUSD: 0.92,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    country: "United Kingdom",
    rateToUSD: 0.79,
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    country: "Japan",
    rateToUSD: 150,
  },
  CNY: {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    country: "China",
    rateToUSD: 7.2,
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    country: "India",
    rateToUSD: 83,
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    country: "Australia",
    rateToUSD: 1.52,
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    country: "Canada",
    rateToUSD: 1.36,
  },
  CHF: {
    code: "CHF",
    symbol: "CHF",
    name: "Swiss Franc",
    country: "Switzerland",
    rateToUSD: 0.88,
  },
  SEK: {
    code: "SEK",
    symbol: "kr",
    name: "Swedish Krona",
    country: "Sweden",
    rateToUSD: 10.5,
  },
  MXN: {
    code: "MXN",
    symbol: "$",
    name: "Mexican Peso",
    country: "Mexico",
    rateToUSD: 17,
  },
  BRL: {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    country: "Brazil",
    rateToUSD: 5.0,
  },
  AED: {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    country: "United Arab Emirates",
    rateToUSD: 3.67,
  },
  SAR: {
    code: "SAR",
    symbol: "﷼",
    name: "Saudi Riyal",
    country: "Saudi Arabia",
    rateToUSD: 3.75,
  },
  SGD: {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    country: "Singapore",
    rateToUSD: 1.33,
  },
};

export const MAJOR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "NGN",
  "ZAR",
  "GHS",
  "KES",
  "EGP",
];

export function getCurrency(code: string): Currency {
  return CURRENCIES[code] || CURRENCIES.USD;
}

export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
): string {
  const currency = getCurrency(currencyCode);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return formatted;
}

// For direct symbol usage
export function formatCurrencySimple(
  amount: number,
  currencyCode: string = "USD",
): string {
  const currency = getCurrency(currencyCode);
  return `${currency.symbol}${Math.abs(amount).toFixed(2)}`;
}

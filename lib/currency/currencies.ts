// Major currencies with conversion rates to USD
// Exchange rates are approximate and should be updated regularly in production
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2 code for flags
  rateToUSD: number; // 1 USD = X currency
  flagUrl?: string;
}

export const CURRENCIES: Record<string, Currency> = {
  // African Countries
  NGN: {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    country: "Nigeria",
    countryCode: "ng",
    rateToUSD: 1550, // 1 USD = 1550 NGN (approximate)
  },
  ZAR: {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    country: "South Africa",
    countryCode: "za",
    rateToUSD: 18.5,
  },
  GHS: {
    code: "GHS",
    symbol: "₵",
    name: "Ghanaian Cedi",
    country: "Ghana",
    countryCode: "gh",
    rateToUSD: 12.5,
  },
  KES: {
    code: "KES",
    symbol: "KSh",
    name: "Kenyan Shilling",
    country: "Kenya",
    countryCode: "ke",
    rateToUSD: 155,
  },
  EGP: {
    code: "EGP",
    symbol: "E£",
    name: "Egyptian Pound",
    country: "Egypt",
    countryCode: "eg",
    rateToUSD: 35,
  },
  UGX: {
    code: "UGX",
    symbol: "USh",
    name: "Ugandan Shilling",
    country: "Uganda",
    countryCode: "ug",
    rateToUSD: 3850,
  },
  ETB: {
    code: "ETB",
    symbol: "Br",
    name: "Ethiopian Birr",
    country: "Ethiopia",
    countryCode: "et",
    rateToUSD: 85,
  },
  TZS: {
    code: "TZS",
    symbol: "TSh",
    name: "Tanzanian Shilling",
    country: "Tanzania",
    countryCode: "tz",
    rateToUSD: 2650,
  },
  RWF: {
    code: "RWF",
    symbol: "FRw",
    name: "Rwandan Franc",
    country: "Rwanda",
    countryCode: "rw",
    rateToUSD: 1350,
  },
  CFA: {
    code: "CFA",
    symbol: "Fr",
    name: "CFA Franc",
    country: "West & Central Africa",
    countryCode: "ci",
    rateToUSD: 610,
  },

  // Major Global Currencies
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    country: "United States",
    countryCode: "us",
    rateToUSD: 1,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    country: "European Union",
    countryCode: "eu",
    rateToUSD: 0.92,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    country: "United Kingdom",
    countryCode: "gb",
    rateToUSD: 0.79,
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    country: "Japan",
    countryCode: "jp",
    rateToUSD: 150,
  },
  CNY: {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    country: "China",
    countryCode: "cn",
    rateToUSD: 7.2,
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    country: "India",
    countryCode: "in",
    rateToUSD: 83,
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    country: "Australia",
    countryCode: "au",
    rateToUSD: 1.52,
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    country: "Canada",
    countryCode: "ca",
    rateToUSD: 1.36,
  },
  CHF: {
    code: "CHF",
    symbol: "CHF",
    name: "Swiss Franc",
    country: "Switzerland",
    countryCode: "ch",
    rateToUSD: 0.88,
  },
  SEK: {
    code: "SEK",
    symbol: "kr",
    name: "Swedish Krona",
    country: "Sweden",
    countryCode: "se",
    rateToUSD: 10.5,
  },
  MXN: {
    code: "MXN",
    symbol: "$",
    name: "Mexican Peso",
    country: "Mexico",
    countryCode: "mx",
    rateToUSD: 17,
  },
  BRL: {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    country: "Brazil",
    countryCode: "br",
    rateToUSD: 5.0,
  },
  AED: {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    country: "United Arab Emirates",
    countryCode: "ae",
    rateToUSD: 3.67,
  },
  SAR: {
    code: "SAR",
    symbol: "﷼",
    name: "Saudi Riyal",
    country: "Saudi Arabia",
    countryCode: "sa",
    rateToUSD: 3.75,
  },
  SGD: {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    country: "Singapore",
    countryCode: "sg",
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

export function getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/w320/${countryCode}.png`;
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

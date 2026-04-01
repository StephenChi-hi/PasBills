// Mapping of country codes to default currencies
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Africa
  NG: "NGN", // Nigeria
  ZA: "ZAR", // South Africa
  GH: "GHS", // Ghana
  KE: "KES", // Kenya
  EG: "EGP", // Egypt
  UG: "UGX", // Uganda
  ET: "ETB", // Ethiopia
  TZ: "TZS", // Tanzania
  RW: "RWF", // Rwanda
  CI: "CFA", // Côte d'Ivoire
  SN: "CFA", // Senegal
  ML: "CFA", // Mali
  BF: "CFA", // Burkina Faso

  // Europe
  DE: "EUR", // Germany
  FR: "EUR", // France
  IT: "EUR", // Italy
  ES: "EUR", // Spain
  NL: "EUR", // Netherlands
  BE: "EUR", // Belgium
  AT: "EUR", // Austria
  IE: "EUR", // Ireland
  GB: "GBP", // United Kingdom
  CH: "CHF", // Switzerland
  SE: "SEK", // Sweden
  NO: "EUR", // Norway
  DK: "EUR", // Denmark

  // Americas
  US: "USD", // United States
  CA: "CAD", // Canada
  MX: "MXN", // Mexico
  BR: "BRL", // Brazil
  AR: "USD", // Argentina
  CO: "USD", // Colombia
  CL: "USD", // Chile

  // Asia
  JP: "JPY", // Japan
  CN: "CNY", // China
  IN: "INR", // India
  SG: "SGD", // Singapore
  TH: "USD", // Thailand
  VN: "USD", // Vietnam
  ID: "USD", // Indonesia
  PH: "USD", // Philippines
  MY: "USD", // Malaysia

  // Middle East
  AE: "AED", // United Arab Emirates
  SA: "SAR", // Saudi Arabia
  KW: "USD", // Kuwait
  QA: "USD", // Qatar

  // Oceania
  AU: "AUD", // Australia
  NZ: "USD", // New Zealand
};

export function getDefaultCurrencyForCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode] || "USD";
}

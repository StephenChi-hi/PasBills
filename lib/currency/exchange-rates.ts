// Static exchange rates - updated periodically
// Returns rates relative to USD

const CACHE_KEY = "pasbills_exchange_rates";

// Static fallback rates
export function getStaticRates(): Record<string, number> {
  return {
    NGN: 1550,
    ZAR: 18.5,
    GHS: 12.5,
    KES: 155,
    EGP: 35,
    UGX: 3850,
    ETB: 85,
    TZS: 2650,
    RWF: 1350,
    CFA: 610,
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150,
    CNY: 7.2,
    INR: 83,
    AUD: 1.52,
    CAD: 1.36,
    CHF: 0.88,
    SEK: 10.5,
    MXN: 17,
    BRL: 5.0,
    AED: 3.67,
    SAR: 3.75,
    SGD: 1.33,
  };
}

// Get rates - returns static rates
export async function getExchangeRates(): Promise<Record<string, number>> {
  const rates = getStaticRates();
  console.log("✅ Using static exchange rates");
  return rates;
}

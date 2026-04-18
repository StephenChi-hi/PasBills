// Token system constants and types

export type TimeRange = "1m" | "3m" | "6m";

export interface TokenPrice {
  range: TimeRange;
  label: string;
  tokens: number;
  description: string;
}

export const TOKEN_PRICES: TokenPrice[] = [
  {
    range: "1m",
    label: "1 Month",
    tokens: 100,
    description: "Analyze last 30 days",
  },
  {
    range: "3m",
    label: "3 Months",
    tokens: 250,
    description: "Analyze last 90 days",
  },
  {
    range: "6m",
    label: "6 Months",
    tokens: 450,
    description: "Analyze last 180 days",
  },
];

export const TOKEN_PACKAGES = [
  { tokens: 500, price: 750, label: "500 Tokens" },
  { tokens: 1500, price: 2025, label: "1,500 Tokens (Save 10%)" },
  { tokens: 5000, price: 6000, label: "5,000 Tokens (Save 20%)" },
  { tokens: 10000, price: 10500, label: "10,000 Tokens (Save 30%)" },
];

export interface UserTokens {
  user_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  type: "purchase" | "usage";
  amount: number;
  reason?: string;
  created_at: string;
}

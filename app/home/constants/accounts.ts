export interface Account {
  id: string;
  name: string;
  type: string;
}

export const accounts: Account[] = [
  { id: "primary_checking", name: "Primary Checking", type: "Checking" },
  { id: "savings", name: "Savings Account", type: "Savings" },
  { id: "business", name: "Business Account", type: "Business" },
  { id: "investment", name: "Investment Account", type: "Investment" },
  { id: "credit_card", name: "Credit Card", type: "Credit" },
  { id: "cash", name: "Cash", type: "Cash" },
];

export function getAccountById(id: string): Account | undefined {
  return accounts.find((acc) => acc.id === id);
}

export function getAccountName(id: string): string {
  return getAccountById(id)?.name || "Unknown Account";
}

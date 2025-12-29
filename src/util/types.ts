import React from "react";

// types.ts
export type AddEntryTab = "expense" | "income" | "transfer" | "bill";

export interface AddExpenseFormValues {
  amount: string;
  category: string;
  account: string;
  date: string;
  note: string;
}

// --- Types ---

export interface AccountOption {
  id: string;
  name: string;
  icon: React.ElementType;
}

export interface AccountSection {
  category: string;
  options: AccountOption[];
}

export interface SelectAccountTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: AccountOption) => void;
}

export interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedType: AccountOption | null;
}

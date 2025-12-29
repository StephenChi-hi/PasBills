// categories.ts
import {
  CreditCard,
  Coffee,
  ShoppingCart,
  Car,
  Home,
  Heart,
  Gift,
  Zap,
  DollarSign,
  PiggyBank,
  Briefcase,
  BarChart,
  User,
  Truck,
  Book,
  Smartphone,
  ToolCase,
  Airplay,
  Music,
  Film,
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

// Expense categories
export const expenseCategories: Category[] = [
  { id: "1", name: "Food & Drinks", icon: Coffee },
  { id: "2", name: "Shopping", icon: ShoppingCart },
  { id: "3", name: "Transport", icon: Car },
  { id: "4", name: "Housing", icon: Home },
  { id: "5", name: "Health", icon: Heart },
  { id: "6", name: "Gifts", icon: Gift },
  { id: "7", name: "Bills & Utilities", icon: Zap },
  { id: "8", name: "Credit Card Payment", icon: CreditCard },
  { id: "9", name: "Education", icon: Book },
  { id: "10", name: "Subscriptions", icon: Smartphone },
  { id: "11", name: "Repairs & Maintenance", icon: ToolCase },
  { id: "12", name: "Entertainment", icon: Music },
  { id: "13", name: "Travel", icon: Airplay },
  { id: "14", name: "Insurance", icon: User },
  { id: "15", name: "Groceries", icon: ShoppingCart },
  { id: "16", name: "Fuel", icon: Car },
  { id: "17", name: "Dining Out", icon: Coffee },
  { id: "18", name: "Electronics", icon: Smartphone },
  { id: "19", name: "Movies & Shows", icon: Film },
  { id: "20", name: "Miscellaneous", icon: DollarSign },
];

// Income categories
export const incomeCategories: Category[] = [
  { id: "1", name: "Salary", icon: Briefcase },
  { id: "2", name: "Business", icon: BarChart },
  { id: "3", name: "Investments", icon: DollarSign },
  { id: "4", name: "Savings", icon: PiggyBank },
  { id: "5", name: "Gifts Received", icon: Gift },
  { id: "6", name: "Freelance", icon: User },
  { id: "7", name: "Rent Income", icon: Home },
  { id: "8", name: "Dividends", icon: BarChart },
  { id: "9", name: "Interest", icon: DollarSign },
  { id: "10", name: "Bonuses", icon: Briefcase },
  { id: "11", name: "Refunds", icon: CreditCard },
  { id: "12", name: "Lottery / Gambling", icon: Zap },
  { id: "13", name: "Sale of Assets", icon: ShoppingCart },
  { id: "14", name: "Royalties", icon: Music },
  { id: "15", name: "Commission", icon: BarChart },
  { id: "16", name: "Scholarship", icon: Book },
  { id: "17", name: "Allowance", icon: User },
  { id: "18", name: "Crowdfunding", icon: Airplay },
  { id: "19", name: "Affiliate Income", icon: DollarSign },
  { id: "20", name: "Miscellaneous", icon: PiggyBank },
];

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
  BarChart2,
  User,
  Book,
  Smartphone,
  Wrench,
  Airplay,
  Music,
  Film,
  Circle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Map iconKey values stored in Category.iconKey to real Lucide components
export const categoryIconMap: Record<string, LucideIcon> = {
  Coffee,
  ShoppingCart,
  Car,
  Home,
  Heart,
  Gift,
  Zap,
  CreditCard,
  Book,
  Smartphone,
  Wrench,
  Music,
  Airplay,
  User,
  DollarSign,
  PiggyBank,
  Briefcase,
  BarChart2,
  Film,
};

export function getCategoryIcon(iconKey?: string | null): LucideIcon {
  if (!iconKey) return Circle;
  return categoryIconMap[iconKey] ?? Circle;
}

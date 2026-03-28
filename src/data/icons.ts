// icons.ts
import React from "react";
import {
  Apple,
  ShoppingCart,
  Coffee,
  Utensils,
  Car,
  Fuel,
  Home,
  Zap,
  Smartphone,
  Speaker,
  Heart,
  Gift,
  Book,
  Baby,
  Palette,
  Music,
  Film,
  Plane,
  Wrench,
  ParkingMeter,
  Shield,
  CreditCard,
  DollarSign,
  Briefcase,
  PiggyBank,
  Dog,
  Dumbbell,
  TrendingUp,
  Target,
  MoreHorizontal,
  Scissors,
  TrendingDown,
  Layers,
  Eye,
  Lightbulb,
  AlertCircle,
  Package,
  Clock,
  MapPin,
  Star,
} from "lucide-react";

export interface IconOption {
  id: string;
  icon: React.ComponentType<any>;
  color: string;
  name: string;
}

export const iconOptions: IconOption[] = [
  { id: "icon_1", icon: Apple, color: "bg-red-100", name: "Apple" },
  {
    id: "icon_2",
    icon: ShoppingCart,
    color: "bg-purple-100",
    name: "Shopping Cart",
  },
  { id: "icon_3", icon: Coffee, color: "bg-amber-100", name: "Coffee" },
  { id: "icon_4", icon: Utensils, color: "bg-orange-100", name: "Utensils" },
  { id: "icon_5", icon: Car, color: "bg-blue-100", name: "Car" },
  { id: "icon_6", icon: Fuel, color: "bg-yellow-100", name: "Fuel" },
  { id: "icon_7", icon: Home, color: "bg-green-100", name: "Home" },
  { id: "icon_8", icon: Zap, color: "bg-yellow-200", name: "Lightning" },
  { id: "icon_9", icon: Smartphone, color: "bg-sky-100", name: "Phone" },
  {
    id: "icon_10",
    icon: Speaker,
    color: "bg-indigo-100",
    name: "Subscription",
  },
  { id: "icon_11", icon: Heart, color: "bg-pink-100", name: "Heart" },
  { id: "icon_12", icon: Gift, color: "bg-rose-100", name: "Gift" },
  { id: "icon_13", icon: Book, color: "bg-cyan-100", name: "Book" },
  { id: "icon_14", icon: Baby, color: "bg-fuchsia-100", name: "Baby" },
  { id: "icon_15", icon: Palette, color: "bg-violet-100", name: "Palette" },
  { id: "icon_16", icon: Music, color: "bg-teal-100", name: "Music" },
  { id: "icon_17", icon: Film, color: "bg-lime-100", name: "Film" },
  { id: "icon_18", icon: Plane, color: "bg-slate-100", name: "Plane" },
  { id: "icon_19", icon: Wrench, color: "bg-stone-100", name: "Wrench" },
  { id: "icon_20", icon: ParkingMeter, color: "bg-gray-100", name: "Parking" },
  { id: "icon_21", icon: Shield, color: "bg-emerald-100", name: "Shield" },
  {
    id: "icon_22",
    icon: CreditCard,
    color: "bg-blue-200",
    name: "Credit Card",
  },
  { id: "icon_23", icon: DollarSign, color: "bg-green-200", name: "Dollar" },
  { id: "icon_24", icon: Briefcase, color: "bg-amber-200", name: "Briefcase" },
  { id: "icon_25", icon: PiggyBank, color: "bg-pink-200", name: "Piggy Bank" },
  { id: "icon_26", icon: Dog, color: "bg-yellow-300", name: "Pet" },
  { id: "icon_27", icon: Dumbbell, color: "bg-red-200", name: "Fitness" },
  {
    id: "icon_28",
    icon: TrendingUp,
    color: "bg-green-300",
    name: "Trending Up",
  },
  { id: "icon_29", icon: Target, color: "bg-orange-200", name: "Target" },
  { id: "icon_30", icon: MoreHorizontal, color: "bg-zinc-100", name: "More" },
  { id: "icon_31", icon: Scissors, color: "bg-rose-200", name: "Scissors" },
  {
    id: "icon_32",
    icon: TrendingDown,
    color: "bg-red-300",
    name: "Trending Down",
  },
  { id: "icon_33", icon: Layers, color: "bg-purple-200", name: "Layers" },
  { id: "icon_34", icon: Eye, color: "bg-blue-300", name: "Eye" },
  { id: "icon_35", icon: Lightbulb, color: "bg-yellow-400", name: "Lightbulb" },
  { id: "icon_36", icon: AlertCircle, color: "bg-red-100", name: "Alert" },
  { id: "icon_37", icon: Package, color: "bg-amber-300", name: "Package" },
  { id: "icon_38", icon: Clock, color: "bg-gray-200", name: "Clock" },
  { id: "icon_39", icon: MapPin, color: "bg-green-300", name: "Location" },
  { id: "icon_40", icon: Star, color: "bg-yellow-500", name: "Star" },
];

export const getIconById = (id: string): IconOption | undefined =>
  iconOptions.find((opt) => opt.id === id);

export const getIconComponent = (
  id: string,
): React.ComponentType<any> | null => {
  const icon = getIconById(id);
  return icon?.icon || null;
};

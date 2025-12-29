// mockData.ts
import {
  HiReceiptPercent,
  HiOutlineAcademicCap,
  HiOutlineCreditCard,
  HiOutlineLightBulb,
  HiOutlineHeart,
  HiOutlineCake,
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineShoppingBag,
  HiOutlineHome,
} from "react-icons/hi2";
import { UtensilsCrossed, Theater, Zap, Banknote } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Categories Data */
/* ------------------------------------------------------------------ */

export const recentCategories = [
  {
    id: "cat-1",
    name: "Certificate",
    icon: HiReceiptPercent,
    color: "bg-[#F3A4A4]", // Pinkish red
  },
  {
    id: "cat-2",
    name: "Education",
    icon: HiOutlineAcademicCap,
    color: "bg-[#D1D1D1]", // Light gray
  },
  {
    id: "cat-3",
    name: "Bank Charge",
    icon: HiOutlineCreditCard,
    color: "bg-[#F7B3D2]", // Pink
  },
];

export const allCategories = [
  {
    id: "cat-4",
    name: "Bank Charge",
    icon: HiOutlineCreditCard,
    color: "bg-[#F7B3D2]",
  },
  {
    id: "cat-5",
    name: "Bills & Utilities",
    icon: HiReceiptPercent,
    color: "bg-[#AEC6F4]", // Light blue
  },
  {
    id: "cat-6",
    name: "Charity",
    icon: HiOutlineHeart,
    color: "bg-[#80C4E9]", // Cyan
  },
  {
    id: "cat-7",
    name: "Drink & Dine",
    icon: UtensilsCrossed,
    color: "bg-[#F3A4A4]",
  },
  {
    id: "cat-8",
    name: "Education",
    icon: HiOutlineAcademicCap,
    color: "bg-[#D1D1D1]",
  },
  {
    id: "cat-9",
    name: "Entertainment",
    icon: Theater,
    color: "bg-[#D1D1D1]",
  },
  {
    id: "cat-10",
    name: "Equipments",
    icon: Zap,
    color: "bg-[#80C4E9]",
  },
  {
    id: "cat-11",
    name: "Events",
    icon: HiOutlineCake,
    color: "bg-[#E6A4F3]", // Purple
  },
  {
    id: "cat-12",
    name: "Family Care",
    icon: HiOutlineUsers,
    color: "bg-[#A4F3E6]", // Teal
  },
  {
    id: "cat-13",
    name: "Fees & charges",
    icon: Banknote,
    color: "bg-[#F3D1A4]", // Peach
  },
  {
    id: "cat-14",
    name: "Financial Services",
    icon: HiOutlineBriefcase,
    color: "bg-[#C4A4F3]", // Lavender
  },
  {
    id: "cat-15",
    name: "Food & Grocery",
    icon: HiOutlineShoppingBag,
    color: "bg-[#A4F3B1]", // Light green
  },
];

/* ------------------------------------------------------------------ */
/* Accounts Data */
/* ------------------------------------------------------------------ */

export const mockAccounts = [
  {
    id: "acc-1",
    name: "VFD",
    type: "Bank account",
    balance: 1467167.75,
    iconType: "bank" as const,
  },
  {
    id: "acc-2",
    name: "Bybit",
    type: "Crypto",
    balance: 830318.95,
    iconType: "crypto" as const,
  },
  {
    id: "acc-3",
    name: "PalmPay",
    type: "Bank account",
    balance: 60766.54,
    iconType: "bank" as const,
  },
  {
    id: "acc-4",
    name: "Bitget",
    type: "Crypto",
    balance: 4277.33,
    iconType: "crypto" as const,
  },
  {
    id: "acc-5",
    name: "Opay",
    type: "Bank account",
    balance: 43.66,
    iconType: "bank" as const,
  },
];

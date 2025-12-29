// accountTypes.ts
import {
  FaPiggyBank,
  FaMoneyCheckAlt,
  FaHandHoldingUsd,
  FaLeaf,
  FaBitcoin,
} from "react-icons/fa";
import {
  HiOutlineBanknotes,
  HiOutlineBuildingLibrary,
  HiOutlineWallet,
  HiOutlineCreditCard,
  HiOutlineChartBar,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { TbHorseToy } from "react-icons/tb";
import { AccountSection } from "@/util/types"; // adjust path if needed

export const accountTypes: AccountSection[] = [
  {
    category: "Cash",
    options: [
      { id: "savings", name: "Savings", icon: FaPiggyBank, category: "cash" },
      {
        id: "checking",
        name: "Checking",
        icon: FaMoneyCheckAlt,
        category: "cash",
      },
      { id: "cash", name: "Cash", icon: HiOutlineBanknotes, category: "cash" },
      {
        id: "bank-account",
        name: "Bank account",
        icon: HiOutlineBuildingLibrary,
        category: "cash",
      },
      { id: "wallet", name: "Wallet", icon: HiOutlineWallet, category: "cash" },
      {
        id: "lending",
        name: "Lending",
        icon: FaHandHoldingUsd,
        category: "cash",
      },
    ],
  },
  {
    category: "Credit",
    options: [
      {
        id: "credit-card",
        name: "Credit Card",
        icon: HiOutlineCreditCard,
        category: "credit",
      },
      {
        id: "line-of-credit",
        name: "Line of Credit",
        icon: FaHandHoldingUsd,
        category: "credit",
      },
    ],
  },
  {
    category: "Investments",
    options: [
      {
        id: "brokerage",
        name: "Brokerage",
        icon: HiOutlineChartBar,
        category: "credit",
      },
      {
        id: "investments",
        name: "Investments",
        icon: FaLeaf,
        category: "credit",
      },
      {
        id: "insurance",
        name: "Insurance",
        icon: HiOutlineDocumentText,
        category: "credit",
      },
      {
        id: "retirement",
        name: "Retirement",
        icon: TbHorseToy,
        category: "credit",
      },
      { id: "crypto", name: "Crypto", icon: FaBitcoin, category: "credit" },
    ],
  },
];

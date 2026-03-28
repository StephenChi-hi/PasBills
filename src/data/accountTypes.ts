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
    category: "Assets",
    options: [
      {
        id: "brokerage",
        name: "Brokerage",
        icon: HiOutlineChartBar,
        category: "investment",
      },
      {
        id: "investments",
        name: "Investments",
        icon: FaLeaf,
        category: "investment",
      },
      {
        id: "insurance",
        name: "Insurance",
        icon: HiOutlineDocumentText,
        category: "investment",
      },
      {
        id: "retirement",
        name: "Retirement",
        icon: TbHorseToy,
        category: "investment",
      },
      { id: "crypto", name: "Crypto", icon: FaBitcoin, category: "investment" },
      {
        id: "property",
        name: "Property",
        icon: HiOutlineBuildingLibrary,
        category: "investment",
      },
      {
        id: "real-estate",
        name: "Real Estate",
        icon: HiOutlineDocumentText,
        category: "investment",
      },
      {
        id: "vehicle",
        name: "Vehicle",
        icon: FaLeaf,
        category: "investment",
      },
    ],
  },
];

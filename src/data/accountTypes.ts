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
      { id: "savings", name: "Savings", icon: FaPiggyBank },
      { id: "checking", name: "Checking", icon: FaMoneyCheckAlt },
      { id: "cash", name: "Cash", icon: HiOutlineBanknotes },
      {
        id: "bank-account",
        name: "Bank account",
        icon: HiOutlineBuildingLibrary,
      },
      { id: "wallet", name: "Wallet", icon: HiOutlineWallet },
      { id: "lending", name: "Lending", icon: FaHandHoldingUsd },
    ],
  },
  {
    category: "Credit",
    options: [
      { id: "credit-card", name: "Credit Card", icon: HiOutlineCreditCard },
      { id: "line-of-credit", name: "Line of Credit", icon: FaHandHoldingUsd },
    ],
  },
  {
    category: "Investments",
    options: [
      { id: "brokerage", name: "Brokerage", icon: HiOutlineChartBar },
      { id: "investments", name: "Investments", icon: FaLeaf },
      { id: "insurance", name: "Insurance", icon: HiOutlineDocumentText },
      { id: "retirement", name: "Retirement", icon: TbHorseToy },
      { id: "crypto", name: "Crypto", icon: FaBitcoin },
    ],
  },
];

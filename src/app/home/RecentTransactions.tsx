import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  HiOutlineChevronRight,
  HiOutlineReceiptPercent,
  HiOutlineCurrencyDollar,
  HiOutlineCreditCard,
} from "react-icons/hi2";

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  category: "certificate" | "bonus" | "charge";
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll?: () => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onViewAll,
}) => {
  // Helper to determine icon and background color based on category
  const getIconDetails = (category: Transaction["category"]) => {
    switch (category) {
      case "certificate":
        return {
          icon: HiOutlineReceiptPercent,
          bg: "bg-[#F3A4A4]",
          color: "text-[#4A1D1D]",
        };
      case "bonus":
        return {
          icon: HiOutlineCurrencyDollar,
          bg: "#B2B599",
          color: "text-[#4A4D35]",
        };
      case "charge":
        return {
          icon: HiOutlineCreditCard,
          bg: "bg-[#F7B3D2]",
          color: "text-[#5C213B]",
        };
      default:
        return {
          icon: HiOutlineReceiptPercent,
          bg: "bg-gray-200",
          color: "text-gray-700",
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl  w-full  border border-gray-200 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Paragraph3 className="text-xl font-bold text-gray-900">
          Recent Transactions
        </Paragraph3>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 px-4 py-1.5 border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <span className="text-sm font-bold">View All</span>
          <HiOutlineChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {transactions.map((tx) => {
          const { icon: Icon, bg, color } = getIconDetails(tx.category);
          const isIncome = tx.type === "income";

          return (
            <div key={tx.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icon Container */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    typeof bg === "string" && bg.startsWith("bg-") ? bg : ""
                  }`}
                  style={!bg.startsWith("bg-") ? { backgroundColor: bg } : {}}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>

                {/* Info */}
                <div>
                  <Paragraph1 className="text-base font-bold text-gray-900 leading-tight">
                    {tx.title}
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-medium text-gray-400">
                    {tx.date}
                  </Paragraph1>
                </div>
              </div>

              {/* Amount */}
              <Paragraph1
                className={`text-base font-bold ${
                  isIncome ? "text-[#57B07E]" : "text-gray-900"
                }`}
              >
                {isIncome ? "+ " : ""}₦{tx.amount.toLocaleString()}
              </Paragraph1>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions;

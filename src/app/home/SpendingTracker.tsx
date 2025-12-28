import React from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import MonthlySpendingGraph from "./MonthlySpendingGraph";

const SpendingTracker: React.FC = () => {
  // Current spending data
  const spendingAmount = "6,143.00";
  const projectedAmount = "6,143.00";
  const currencySymbol = "₦";

  return (
    <div className="font-sans w-full  bg-[#F4F5F7] py-4 p-2 sm:p-6 rounded-2xl border border-gray-200">
      {/* Header Info */}
      <div className="mb-6">
        <Paragraph1 className="text-gray-500 text-sm  mb-1">
          Spending in December
        </Paragraph1>
        <Paragraph2 className="text-3xl font-bold text-gray-900 mb-4">
          {currencySymbol}
          {spendingAmount}
        </Paragraph2>
        <Paragraph1 className="text-sm  text-gray-800">
          Projected {currencySymbol}
          {projectedAmount}
        </Paragraph1>
      </div>

      {/* Graph Section */}
      <MonthlySpendingGraph currencySymbol={currencySymbol} />
    </div>
  );
};

export default SpendingTracker;

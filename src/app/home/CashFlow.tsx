import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { HiChevronRight } from "react-icons/hi2";

const CashFlow: React.FC = () => {
  const currency = "₦";

  return (
    <div className="font-sans w-full bg-white p-6 rounded-2xl  border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Paragraph3 className="text-xl font-bold text-gray-900">Cash Flow</Paragraph3>
        <HiChevronRight className="w-5 h-5 text-blue-500 cursor-pointer" />
      </div>

      <div className="space-y-2">
        {/* Income Section (Dec) */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <Paragraph1 className="text-sm font-bold text-gray-900">December</Paragraph1>
            <div className="flex items-center space-x-2">
              <Paragraph1 className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                ↑ 100%
              </Paragraph1>
              <Paragraph1 className="text-lg font-bold text-green-500">
                +{currency}2,555
              </Paragraph1>
            </div>
          </div>
          {/* Progress Bar Container for  income */}
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[40%] rounded-full" />
          </div>
        </div>

        {/* Progress Bar Container for expenses */}
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div className="bg-orange-500 h-full w-full rounded-full" />
        </div>

        {/* Expense Section (Monthly) */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <Paragraph1 className="text-sm font-medium text-gray-400">Monthly</Paragraph1>
            <div className="flex items-center space-x-2">
              <Paragraph1 className="bg-blue-50 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                ↑ 100%
              </Paragraph1>
              <Paragraph1 className="text-lg font-bold text-gray-900">
                -{currency}6,143
              </Paragraph1>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Projected Balance */}
      <div className="mt-8 pt-4 border-t border-gray-50 text-center">
        <Paragraph1 className="text-sm font-medium text-gray-900">
          Projected Balance of{" "}
          <span className="text-red-500 font-bold ml-1">-{currency}3,588</span>
        </Paragraph1>
      </div>
    </div>
  );
};

export default CashFlow;

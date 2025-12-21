import React from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import {
  HiChevronRight,
  HiOutlineBanknotes,
  HiOutlinePresentationChartLine,
} from "react-icons/hi2";

const Networth: React.FC = () => {
  const currency = "₦";
  const totalNetworth = "2,362,574.23";
  const cashAmount = "1,527,978";
  const investmentAmount = "834,596";

  return (
    <div className="font-sans w-full  bg-gray-50 sm:p-6 p-2 py-4 rounded-2xl  border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <Paragraph1 className="text-xl font-bold text-gray-900">Networth</Paragraph1>
        <HiChevronRight className="w-6 h-6 text-blue-500 cursor-pointer" />
      </div>

      {/* Total Balance */}
      <div className="mb-6">
        <Paragraph2 className="text-2xl font-black text-gray-900">
          {currency}
          {totalNetworth}
        </Paragraph2>
      </div>

      {/* Breakdown Container */}
      <div className="bg-gray-100 rounded-xl p-2 px-3 - space-y-2">
        {/* Cash Row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <div className="w-10 h-10  rounded-full flex items-center justify-center border border-black  text-gray-700 shadow-sm">
              <HiOutlineBanknotes className="w-6 h-6" />
            </div>
            <Paragraph1 className="text-base font-semibold text-gray-800">Cash</Paragraph1>
          </div>
          <Paragraph1 className="text-base font-bold text-gray-900">
            {currency}
            {cashAmount}
          </Paragraph1>
        </div>

        {/* Divider */}
        <div className="border-t border-white mx-1" />

        {/* Investments Row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <div className="w-10 h-10  rounded-full flex items-center justify-center border border-black text-gray-700 shadow-sm">
              <HiOutlinePresentationChartLine className="w-6 h-6" />
            </div>
            <Paragraph1 className="text-base font-semibold text-gray-800">
              Investments
            </Paragraph1>
          </div>
          <Paragraph1 className="text-base font-bold text-gray-900">
            {currency}
            {investmentAmount}
          </Paragraph1>
        </div>
      </div>
    </div>
  );
};

export default Networth;

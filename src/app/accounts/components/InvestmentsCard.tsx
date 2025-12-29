import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { Pencil, ChevronRight, Bitcoin } from "lucide-react";

interface InvestmentAccount {
  name: string;
  type: string;
  balance: string;
  icon: React.ElementType;
}

const investmentData: InvestmentAccount[] = [
  {
    name: "Bybit",
    type: "Crypto",
    balance: "830,318.95",
    icon: Bitcoin,
  },
  {
    name: "Bitget",
    type: "Crypto",
    balance: "4,277.33",
    icon: Bitcoin,
  },
];

const InvestmentsCard: React.FC = () => {
  return (
    <div className=" border rounded-2xl border-gray-200 p-4">
      {/* --- Header Section --- */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Paragraph1 className="text-lg font-black text-gray-900">
            Investments
          </Paragraph1>
          {/* Edit/Pencil Icon */}
          <button className="hover:opacity-70 transition-opacity">
            <Pencil className="w-4 h-4 text-blue-400" strokeWidth={2.5} />
          </button>
        </div>

        <button className="flex items-center group">
          <Paragraph1 className="text-lg font-black text-gray-900">
            ₦834,596.28
          </Paragraph1>
          <ChevronRight className="w-6 h-6 text-gray-400 " />
        </button>
      </div>

      {/* --- Accounts List Container --- */}
      <div className=" space-y-2 ">
        {investmentData.map((account, index) => (
          <div
            key={account.name}
            className={`flex items-center justify-between  active:bg-gray-50 transition-colors ${
              index !== investmentData.length - 1
                ? "border-b border-gray-50"
                : ""
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Circular Icon with blue border as seen in image */}
              <div className="w-12 h-12 rounded-full border-[1.5px] border-blue-500 flex items-center justify-center bg-white">
                <account.icon className="w-7 h-7 text-blue-500" />
              </div>

              <div className="flex flex-col">
                <Paragraph1 className="text-[16px] font-bold text-gray-900 leading-tight">
                  {account.name}
                </Paragraph1>
                <Paragraph1 className="text-xs text-gray-400 font-medium">
                  {account.type}
                </Paragraph1>
              </div>
            </div>

            <Paragraph1 className="text-[16px] font-bold text-gray-900">
              ₦{account.balance}
            </Paragraph1>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentsCard;

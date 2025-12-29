"use client"

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  Menu,
  SlidersHorizontal,
  Plus,
  Pencil,
  ChevronRight,
  Library,
  Bitcoin,
} from "lucide-react";

const AccountsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Accounts");

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      {/* --- Top Header --- */}
      <header className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
        <Menu className="w-6 h-6 text-blue-500" />
              <h1 className="text-lg font-bold text-gray-900">Accounts</h1>
              
              
        <div className="flex gap-4">
          <SlidersHorizontal className="w-6 h-6 text-blue-500" />
          <Plus className="w-6 h-6 text-blue-500" />
        </div>
      </header>

      {/* --- Networth Section --- */}
      <div className="px-4 py-2 relative overflow-hidden">
        {/* Simple representation of the wave background chart */}
        <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path
              d="M0,80 Q50,90 100,50 T200,20 L200,100 L0,100 Z"
              fill="#0ea5e9"
            />
          </svg>
        </div>

        <div className="flex justify-between items-start mb-2">
          <Paragraph1 className="text-sm font-medium text-gray-900">
            Networth
          </Paragraph1>
          <button className="flex items-center gap-1 px-3 py-1 border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
            1 Year <ChevronRight className="w-3 h-3 rotate-90" />
          </button>
        </div>
        <Paragraph1 className="text-3xl font-bold text-gray-900 mb-6">
          ₦2,362,574.23
        </Paragraph1>
      </div>

      {/* --- Segmented Control (Tabs) --- */}
      <div className="px-4 mb-6">
        <div className="bg-gray-100 p-1 rounded-full flex">
          {["Accounts", "Trends"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- Accounts List --- */}
      <div className="flex-1 px-4 space-y-8 pb-10">
        {/* Cash Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Paragraph1 className="text-lg font-black text-gray-900">
                Cash
              </Paragraph1>
              <Pencil className="w-4 h-4 text-blue-400" />
            </div>
            <Paragraph1 className="text-lg font-black text-gray-900">
              ₦1,527,977.95 <span className="ml-1">›</span>
            </Paragraph1>
          </div>

          <div className="space-y-6">
            <AccountItem
              name="VFD"
              type="Bank account"
              balance="1,467,167.75"
              icon={<Library className="w-8 h-8 text-blue-500" />}
            />
            <AccountItem
              name="PalmPay"
              type="Bank account"
              balance="60,766.54"
              icon={<Library className="w-8 h-8 text-blue-500" />}
            />
            <AccountItem
              name="Opay"
              type="Bank account"
              balance="43.66"
              icon={<Library className="w-8 h-8 text-blue-500" />}
            />
          </div>
        </section>

        {/* Investments Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Paragraph1 className="text-lg font-black text-gray-900">
                Investments
              </Paragraph1>
              <Pencil className="w-4 h-4 text-blue-400" />
            </div>
            <Paragraph1 className="text-lg font-black text-gray-900">
              ₦834,596.28 <span className="ml-1">›</span>
            </Paragraph1>
          </div>

          <AccountItem
            name="Bybit"
            type="Crypto"
            balance="830,318.95"
            icon={<Bitcoin className="w-8 h-8 text-blue-500" />}
          />
        </section>
      </div>
    </div>
  );
};

// Helper component for each row
interface AccountItemProps {
  name: string;
  type: string;
  balance: string;
  icon: React.ReactNode;
}

const AccountItem: React.FC<AccountItemProps> = ({
  name,
  type,
  balance,
  icon,
}) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg border border-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <Paragraph1 className="text-[16px] font-bold text-gray-900 leading-tight">
          {name}
        </Paragraph1>
        <Paragraph1 className="text-xs text-gray-400 font-medium">
          {type}
        </Paragraph1>
      </div>
    </div>
    <Paragraph1 className="text-[16px] font-bold text-gray-900">
      ₦{balance}
    </Paragraph1>
  </div>
);

export default AccountsPage;

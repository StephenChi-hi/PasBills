"use client";

import React, { useEffect, useState } from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import {
  HiChevronRight,
  HiOutlineBanknotes,
  HiOutlinePresentationChartLine,
} from "react-icons/hi2";
import { supabase } from "@/util/supabase/client";

const Networth: React.FC = () => {
  const currency = "₦";
  const [networth, setNetworth] = useState(0);
  const [cashAmount, setCashAmount] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) return;

      const [accountsRes, investmentsRes] = await Promise.all([
        supabase
          .from("Account")
          .select("balance, category")
          .eq("user_id", userData.user.id),
        supabase
          .from("Investment")
          .select("current_value")
          .eq("user_id", userData.user.id),
      ]);

      const accounts = (accountsRes.data || []) as any[];
      const investments = (investmentsRes.data || []) as any[];

      const cash = accounts
        .filter((a) => a.category === "cash")
        .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

      const otherAccounts = accounts
        .filter((a) => a.category !== "cash")
        .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

      const inv = investments.reduce(
        (sum, i) => sum + (Number(i.current_value) || 0),
        0,
      );

      setCashAmount(cash);
      setInvestmentAmount(inv + otherAccounts);
      setNetworth(cash + otherAccounts + inv);
    };

    load();
  }, []);

  return (
    <div className="font-sans w-full  bg-gray-50 sm:p-6 p-2 py-4 rounded-2xl  border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <Paragraph1 className="text-xl  text-gray-900">Networth</Paragraph1>
        <HiChevronRight className="w-6 h-6 text-blue-500 cursor-pointer" />
      </div>

      {/* Total Balance */}
      <div className="mb-6">
        <Paragraph2 className="text-2xl font-black text-gray-900">
          {currency}
          {networth.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
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
            <Paragraph1 className="text-base font-semibold text-gray-800">
              Cash
            </Paragraph1>
          </div>
          <Paragraph1 className="text-base font-bold text-gray-900">
            {currency}
            {cashAmount.toLocaleString()}
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
            {investmentAmount.toLocaleString()}
          </Paragraph1>
        </div>
      </div>
    </div>
  );
};

export default Networth;

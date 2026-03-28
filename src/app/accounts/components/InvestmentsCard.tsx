"use client";

import React, { useEffect, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { ChevronRight, TrendingUp } from "lucide-react";
import { supabase } from "@/util/supabase/client";

interface InvestmentAccount {
  id: string;
  name: string;
  type_name: string;
  balance: number;
}

const InvestmentsCard: React.FC = () => {
  const [accounts, setAccounts] = useState<InvestmentAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    fetchInvestmentAccounts();

    const handler = () => {
      fetchInvestmentAccounts();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("accounts-updated", handler);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("accounts-updated", handler);
      }
    };
  }, []);

  const fetchInvestmentAccounts = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return;
    }

    const { data, error } = await supabase
      .from("Account")
      .select("id, name, type_name, balance")
      .eq("user_id", userData.user.id)
      .eq("category", "investment");

    if (error || !data) return;

    const mapped: InvestmentAccount[] = (data as any[]).map((acc) => ({
      id: acc.id,
      name: acc.name,
      type_name: acc.type_name,
      balance: Number(acc.balance) || 0,
    }));

    setAccounts(mapped);
    setTotalBalance(mapped.reduce((sum, a) => sum + a.balance, 0));
  };
  return (
    <div className=" border rounded-2xl border-gray-200 p-4">
      {/* --- Header Section --- */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Paragraph1 className="text-lg font-black text-gray-900">
            Assets
          </Paragraph1>
        </div>

        <button className="flex items-center group">
          <Paragraph1 className="text-lg font-black text-gray-900">
            ₦{totalBalance.toLocaleString()}
          </Paragraph1>
          <ChevronRight className="w-6 h-6 text-gray-400 " />
        </button>
      </div>

      {/* --- Accounts List Container --- */}
      <div className=" space-y-2 ">
        {accounts.map((account, index) => (
          <div
            key={account.id}
            className={`flex items-center justify-between  active:bg-gray-50 transition-colors ${
              index !== accounts.length - 1 ? "border-b border-gray-50" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Circular Icon with blue border as seen in image */}
              <div className="w-12 h-12 rounded-full border-[1.5px] border-blue-500 flex items-center justify-center bg-white">
                <TrendingUp className="w-7 h-7 text-blue-500" />
              </div>

              <div className="flex flex-col">
                <Paragraph1 className="text-[16px] font-bold text-gray-900 leading-tight">
                  {account.name}
                </Paragraph1>
                <Paragraph1 className="text-xs text-gray-400 font-medium">
                  {account.type_name}
                </Paragraph1>
              </div>
            </div>

            <Paragraph1 className="text-[16px] font-bold text-gray-900">
              ₦{account.balance.toLocaleString()}
            </Paragraph1>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentsCard;

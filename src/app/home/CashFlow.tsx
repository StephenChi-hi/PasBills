"use client";

import React, { useEffect, useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { HiChevronRight } from "react-icons/hi2";
import { supabase } from "@/util/supabase/client";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

const CashFlow: React.FC = () => {
  const currency = "₦";
  const [incomeThisMonth, setIncomeThisMonth] = useState(0);
  const [expenseThisMonth, setExpenseThisMonth] = useState(0);
  const [incomeChangePct, setIncomeChangePct] = useState(0);
  const [expenseChangePct, setExpenseChangePct] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) return;

      const now = new Date();
      const thisStart = startOfMonth(now);
      const thisEnd = endOfMonth(now);
      const prevStart = startOfMonth(subMonths(now, 1));
      const prevEnd = endOfMonth(subMonths(now, 1));

      const baseQuery = supabase
        .from("Transaction")
        .select("amount, type, date")
        .eq("user_id", userData.user.id)
        .in("type", ["income", "expense"]);

      const [{ data: thisData }, { data: prevData }] = await Promise.all([
        baseQuery
          .gte("date", thisStart.toISOString())
          .lte("date", thisEnd.toISOString()),
        baseQuery
          .gte("date", prevStart.toISOString())
          .lte("date", prevEnd.toISOString()),
      ]);

      const sumByType = (rows: any[] | null | undefined, type: string) =>
        (rows || [])
          .filter((r) => r.type === type)
          .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      const incomeNow = sumByType(thisData, "income");
      const expenseNow = sumByType(thisData, "expense");
      const incomePrev = sumByType(prevData, "income");
      const expensePrev = sumByType(prevData, "expense");

      setIncomeThisMonth(incomeNow);
      setExpenseThisMonth(expenseNow);

      const incomePct =
        incomePrev > 0 ? ((incomeNow - incomePrev) / incomePrev) * 100 : 0;
      const expensePct =
        expensePrev > 0 ? ((expenseNow - expensePrev) / expensePrev) * 100 : 0;
      setIncomeChangePct(Math.round(incomePct));
      setExpenseChangePct(Math.round(expensePct));
    };

    load();
  }, []);

  const projectedBalance = incomeThisMonth - expenseThisMonth;

  return (
    <div className="font-sans w-full bg-white p-6 rounded-2xl  border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Paragraph3 className="text-xl font-bold text-gray-900">
          Cash Flow
        </Paragraph3>
        <HiChevronRight className="w-5 h-5 text-blue-500 cursor-pointer" />
      </div>

      <div className="space-y-2">
        {/* Income Section (Dec) */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <Paragraph1 className="text-sm font-bold text-gray-900">
              December
            </Paragraph1>
            <div className="flex items-center space-x-2">
              <Paragraph1 className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                {incomeChangePct >= 0 ? "↑" : "↓"} {Math.abs(incomeChangePct)}%
              </Paragraph1>
              <Paragraph1 className="text-lg font-bold text-green-500">
                +{currency}
                {incomeThisMonth.toLocaleString()}
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
            <Paragraph1 className="text-sm font-medium text-gray-400">
              Monthly
            </Paragraph1>
            <div className="flex items-center space-x-2">
              <Paragraph1 className="bg-blue-50 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                {expenseChangePct >= 0 ? "↑" : "↓"} {Math.abs(expenseChangePct)}
                %
              </Paragraph1>
              <Paragraph1 className="text-lg font-bold text-gray-900">
                -{currency}
                {expenseThisMonth.toLocaleString()}
              </Paragraph1>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Projected Balance */}
      <div className="mt-8 pt-4 border-t border-gray-50 text-center">
        <Paragraph1 className="text-sm font-medium text-gray-900">
          Projected Balance of{" "}
          <span
            className={`font-bold ml-1 ${
              projectedBalance >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {projectedBalance >= 0 ? null : "-"}
            {currency}
            {Math.abs(projectedBalance).toLocaleString()}
          </span>
        </Paragraph1>
      </div>
    </div>
  );
};

export default CashFlow;

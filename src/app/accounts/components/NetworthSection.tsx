"use client";

import React, { useEffect, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { ChevronRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { supabase } from "@/util/supabase/client";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const NetworthSection: React.FC = () => {
  const [networth, setNetworth] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) return;

      const [accountsRes, investmentsRes] = await Promise.all([
        supabase
          .from("Account")
          .select("balance")
          .eq("user_id", userData.user.id),
        supabase
          .from("Investment")
          .select("current_value")
          .eq("user_id", userData.user.id),
      ]);

      const accounts = (accountsRes.data || []) as any[];
      const investments = (investmentsRes.data || []) as any[];

      const accSum = accounts.reduce(
        (sum, a) => sum + (Number(a.balance) || 0),
        0,
      );
      const invSum = investments.reduce(
        (sum, i) => sum + (Number(i.current_value) || 0),
        0,
      );

      setNetworth(accSum + invSum);
    };

    load();

    const handler = () => {
      load();
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

  const chartData = months.map((m) => ({ month: m, value: networth }));

  return (
    <div className="w-full bg-white border rounded-2xl border-gray-200 p-4 ">
      {/* --- Header Section --- */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-500 mb-1">
            Networth
          </Paragraph1>
          <Paragraph1 className="text-3xl font-bold text-gray-900">
            ₦
            {networth.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Paragraph1>
        </div>

        {/* --- Time Period Dropdown --- */}
        <button className="flex items-center gap-1 px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          1 Year
          <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
        </button>
      </div>

      {/* --- Chart Section --- */}
      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              dy={10}
            />
            <YAxis
              hide={true}
              domain={["dataMin - 100000", "dataMax + 100000"]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg ">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-sm font-bold text-gray-900">
                        ₦
                        {typeof payload[0].value === "number"
                          ? payload[0].value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : payload[0].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0ea5e9"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetworthSection;

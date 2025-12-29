"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Dec", amount: 0 },
  { month: "Jan", amount: 0 },
  { month: "Feb", amount: 0 },
  { month: "Mar", amount: 0 },
  { month: "Apr", amount: 0 },
  { month: "May", amount: 0 },
  { month: "Jun", amount: 0 },
  { month: "Jul", amount: 0 },
  { month: "Aug", amount: 0 },
  { month: "Sep", amount: 0 },
  { month: "Oct", amount: 0 },
  { month: "Nov", amount: 5000 },
  { month: "Dec", amount: 1527977.95 },
];

const InvestmentTrend: React.FC = () => {
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="w-full bg-white p-4 rounded-2xl border border-gray-200">
      {/* Title */}
      <div className="text-center mb-3">
        <Paragraph1 className="text-lg sm:text-xl font-bold text-gray-900">
          Cash
        </Paragraph1>
      </div>

      {/* Chart */}
      <div className="w-full h-55 [220px] sm:h-75 [300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 12, left: 0, bottom: 10 }}
          >
            <CartesianGrid horizontal={false} stroke="#E5E7EB" />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine
              tick={{ fontSize: 11, fill: "#111827" }}
              interval={window.innerWidth < 640 ? 3 : 1} // fewer ticks on mobile
            />

            {/* Hide Y-axis on mobile */}
            <YAxis
              className="hidden sm:block"
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine
              tick={{ fontSize: 12, fill: "#111827" }}
            />

            <Tooltip
              formatter={(value) =>
                typeof value === "number"
                  ? [`₦${value.toLocaleString()}`, "Amount"]
                  : ["₦0", "Amount"]
              }
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: "12px",
              }}
            />

            <Line
              type="linear"
              dataKey="amount"
              stroke="#A3D139"
              strokeWidth={2}
              dot={false} // cleaner on mobile
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer label */}
      <div className="text-center mt-2">
        <Paragraph1 className="text-xs sm:text-sm font-medium text-gray-400">
          Amount (NGN)
        </Paragraph1>
      </div>
    </div>
  );
};

export default InvestmentTrend;

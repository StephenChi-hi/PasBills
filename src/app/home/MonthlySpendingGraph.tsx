"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  currencySymbol: string;
  data: { day: string; amount: number }[];
}

export default function MonthlySpendingGraph({ currencySymbol, data }: Props) {
  return (
    <div className="bg-[#E5E7EB] rounded-xl p-4 h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {/* Hide axes visually but keep spacing correct */}
          <XAxis dataKey="day" hide />
          <YAxis hide />

          {/* Tooltip ONLY on hover */}
          <Tooltip
            cursor={{ stroke: "#9CA3AF", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white px-3 py-1 rounded-lg shadow border border-gray-200">
                    <p className="text-xs font-semibold text-gray-800">
                      {currencySymbol}
                      {payload[0].value?.toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Main line */}
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#EF4444"
            strokeWidth={2.5}
            dot={{
              r: 3,
              fill: "#EF4444",
            }}
            activeDot={{
              r: 5,
              fill: "#FFFFFF",
              stroke: "#EF4444",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

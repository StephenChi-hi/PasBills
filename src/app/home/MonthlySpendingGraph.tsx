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
}

const data = [
  { day: "1", amount: 1200 },
  { day: "5", amount: 1800 },
  { day: "10", amount: 2400 },
  { day: "15", amount: 3200 },
  { day: "20", amount: 4100 },
  { day: "25", amount: 5146 },
  { day: "30", amount: 6146 },
];


export default function MonthlySpendingGraph({ currencySymbol }: Props) {
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

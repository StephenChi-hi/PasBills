"use client";

import React from "react";
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

// Sample data to represent a net worth trend over a year
const data = [
  { month: "Jan", value: 1800000 },
  { month: "Feb", value: 1850000 },
  { month: "Mar", value: 1920000 },
  { month: "Apr", value: 1900000 },
  { month: "May", value: 2050000 },
  { month: "Jun", value: 2100000 },
  { month: "Jul", value: 2250000 },
  { month: "Aug", value: 2200000 },
  { month: "Sep", value: 2300000 },
  { month: "Oct", value: 2350000 },
  { month: "Nov", value: 2320000 },
  { month: "Dec", value: 2362574.23 },
];

const NetworthSection: React.FC = () => {
  return (
    <div className="w-full bg-white border rounded-2xl border-gray-200 p-4 ">
      {/* --- Header Section --- */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-500 mb-1">
            Networth
          </Paragraph1>
          <Paragraph1 className="text-3xl font-bold text-gray-900">
            ₦2,362,574.23
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
            data={data}
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

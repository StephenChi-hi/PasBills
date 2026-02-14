"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { TrendingUp } from "lucide-react";

const SpendingForecastPage: React.FC = () => {
  return (
    <main className="w-full py-6 space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <Paragraph3 className="text-sm uppercase tracking-wide opacity-80">
            Spending Forecast
          </Paragraph3>
          <Paragraph2 className="text-2xl sm:text-3xl font-bold mt-1">
            Look ahead before you spend
          </Paragraph2>
          <Paragraph1 className="text-sm sm:text-base mt-2 max-w-xl opacity-90">
            This page will later use your history to project upcoming spending
            and show whether you&apos;re on track.
          </Paragraph1>
        </div>
        <TrendingUp className="hidden sm:block w-12 h-12" />
      </div>

      <section className="border border-gray-200 rounded-2xl p-4 bg-white">
        <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
          Forecast chart (coming soon)
        </Paragraph2>
        <Paragraph1 className="text-sm text-gray-600">
          A chart and projections will appear here to estimate end-of-month
          balances based on your current pace.
        </Paragraph1>
      </section>
    </main>
  );
};

export default SpendingForecastPage;

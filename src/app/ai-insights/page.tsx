"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { Sparkles } from "lucide-react";

const AiInsightsPage: React.FC = () => {
  return (
    <main className="w-full py-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <Paragraph3 className="text-sm uppercase tracking-wide opacity-80">
            AI Insights
          </Paragraph3>
          <Paragraph2 className="text-2xl sm:text-3xl font-bold mt-1">
            Understand your money at a glance
          </Paragraph2>
          <Paragraph1 className="text-sm sm:text-base mt-2 max-w-xl opacity-90">
            This space will surface smart highlights about your cash flow,
            spending patterns, and savings opportunities based on your
            transactions.
          </Paragraph1>
        </div>
        <Sparkles className="hidden sm:block w-12 h-12" />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-2xl p-4 bg-white">
          <Paragraph3 className="text-xs text-gray-500 mb-1">
            Coming soon
          </Paragraph3>
          <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
            Smart alerts
          </Paragraph2>
          <Paragraph1 className="text-sm text-gray-600">
            Get notified when your spending spikes or a bill is higher than
            usual.
          </Paragraph1>
        </div>
        <div className="border border-gray-200 rounded-2xl p-4 bg-white">
          <Paragraph3 className="text-xs text-gray-500 mb-1">
            Coming soon
          </Paragraph3>
          <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
            Income insights
          </Paragraph2>
          <Paragraph1 className="text-sm text-gray-600">
            See how your income trends over time and how stable it is month to
            month.
          </Paragraph1>
        </div>
        <div className="border border-gray-200 rounded-2xl p-4 bg-white">
          <Paragraph3 className="text-xs text-gray-500 mb-1">
            Coming soon
          </Paragraph3>
          <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
            Savings opportunities
          </Paragraph2>
          <Paragraph1 className="text-sm text-gray-600">
            Suggestions on where to cut back so you can save more without
            stress.
          </Paragraph1>
        </div>
      </section>
    </main>
  );
};

export default AiInsightsPage;

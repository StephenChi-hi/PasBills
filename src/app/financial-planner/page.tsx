"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { CalendarCheck } from "lucide-react";

const FinancialPlannerPage: React.FC = () => {
  return (
    <main className="w-full py-6 space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <Paragraph3 className="text-sm uppercase tracking-wide opacity-80">
            Financial Planner
          </Paragraph3>
          <Paragraph2 className="text-2xl sm:text-3xl font-bold mt-1">
            Plan upcoming income and bills
          </Paragraph2>
          <Paragraph1 className="text-sm sm:text-base mt-2 max-w-xl opacity-90">
            Use this space to coordinate your bills, income dates, and savings
            goals. This will connect more deeply with your bills and planner in
            a later version.
          </Paragraph1>
        </div>
        <CalendarCheck className="hidden sm:block w-12 h-12" />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-2xl p-4 bg-white">
          <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
            Timeline view
          </Paragraph2>
          <Paragraph1 className="text-sm text-gray-600">
            Soon you&apos;ll be able to see a unified calendar of bills,
            expected income, and transfers here.
          </Paragraph1>
        </div>
        <div className="border border-gray-200 rounded-2xl p-4 bg-white">
          <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
            Goals
          </Paragraph2>
          <Paragraph1 className="text-sm text-gray-600">
            Outline savings goals and track how much of your monthly cash flow
            you can dedicate to each one.
          </Paragraph1>
        </div>
      </section>
    </main>
  );
};

export default FinancialPlannerPage;

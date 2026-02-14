"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { FileText } from "lucide-react";

const MonthlyReportsPage: React.FC = () => {
  return (
    <main className="w-full py-6 space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <Paragraph3 className="text-sm uppercase tracking-wide opacity-80">
            Monthly Reports
          </Paragraph3>
          <Paragraph2 className="text-2xl sm:text-3xl font-bold mt-1">
            Export-ready summaries of each month
          </Paragraph2>
          <Paragraph1 className="text-sm sm:text-base mt-2 max-w-xl opacity-90">
            Quickly review how much you earned, spent, and saved every month.
            Future versions will let you export detailed PDFs.
          </Paragraph1>
        </div>
        <FileText className="hidden sm:block w-12 h-12" />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-2xl p-4 bg-white">
          <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
            Reports timeline
          </Paragraph2>
          <Paragraph1 className="text-sm text-gray-600">
            Soon you&apos;ll see a list of your past months here, each with a
            downloadable report.
          </Paragraph1>
        </div>
        <div className="border border-gray-200 rounded-2xl p-4 bg-white">
          <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
            Export formats
          </Paragraph2>
          <Paragraph1 className="text-sm text-gray-600">
            PDF, CSV, or shareable links so you can send reports to an
            accountant or advisor.
          </Paragraph1>
        </div>
      </section>
    </main>
  );
};

export default MonthlyReportsPage;

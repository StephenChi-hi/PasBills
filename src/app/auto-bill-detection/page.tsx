"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { Repeat } from "lucide-react";

const AutoBillDetectionPage: React.FC = () => {
  return (
    <main className="w-full py-6 space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-sky-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <Paragraph3 className="text-sm uppercase tracking-wide opacity-80">
            Auto Bill Detection
          </Paragraph3>
          <Paragraph2 className="text-2xl sm:text-3xl font-bold mt-1">
            Let the app spot recurring payments for you
          </Paragraph2>
          <Paragraph1 className="text-sm sm:text-base mt-2 max-w-xl opacity-90">
            In the future this page will scan your transactions and suggest
            bills to track automatically.
          </Paragraph1>
        </div>
        <Repeat className="hidden sm:block w-12 h-12" />
      </div>

      <section className="border border-gray-200 rounded-2xl p-4 bg-white">
        <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
          Detection queue
        </Paragraph2>
        <Paragraph1 className="text-sm text-gray-600">
          When it&apos;s live, you&apos;ll see suggested bills here with one-tap
          options to confirm or ignore them.
        </Paragraph1>
      </section>
    </main>
  );
};

export default AutoBillDetectionPage;

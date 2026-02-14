"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { LayoutGrid } from "lucide-react";

const SmartWidgetPage: React.FC = () => {
  return (
    <main className="w-full py-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <Paragraph3 className="text-sm uppercase tracking-wide opacity-80">
            Smart Widget
          </Paragraph3>
          <Paragraph2 className="text-2xl sm:text-3xl font-bold mt-1">
            Mini widgets for your favourite stats
          </Paragraph2>
          <Paragraph1 className="text-sm sm:text-base mt-2 max-w-xl opacity-90">
            In the future you&apos;ll be able to pin quick views of your cash,
            top categories, or upcoming bills anywhere in the app.
          </Paragraph1>
        </div>
        <LayoutGrid className="hidden sm:block w-12 h-12" />
      </div>

      <section className="border border-dashed border-purple-300 rounded-2xl p-6 bg-white/60">
        <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
          Widget gallery (coming soon)
        </Paragraph2>
        <Paragraph1 className="text-sm text-gray-600">
          This is where configurable widgets will live — balance tiles, category
          bubbles, goal trackers and more.
        </Paragraph1>
      </section>
    </main>
  );
};

export default SmartWidgetPage;

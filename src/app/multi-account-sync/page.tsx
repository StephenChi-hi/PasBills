"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { CreditCard } from "lucide-react";

const MultiAccountSyncPage: React.FC = () => {
  return (
    <main className="w-full py-6 space-y-6">
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <Paragraph3 className="text-sm uppercase tracking-wide opacity-80">
            Multi-Account Sync
          </Paragraph3>
          <Paragraph2 className="text-2xl sm:text-3xl font-bold mt-1">
            See all your money in one place
          </Paragraph2>
          <Paragraph1 className="text-sm sm:text-base mt-2 max-w-xl opacity-90">
            For now you can add accounts manually. In the future, this page will
            connect to banks and wallets to keep balances fresh.
          </Paragraph1>
        </div>
        <CreditCard className="hidden sm:block w-12 h-12" />
      </div>

      <section className="border border-gray-200 rounded-2xl p-4 bg-white">
        <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
          Connected institutions
        </Paragraph2>
        <Paragraph1 className="text-sm text-gray-600">
          When live, this section will show the banks and providers you have
          synced, plus their last refresh time.
        </Paragraph1>
      </section>
    </main>
  );
};

export default MultiAccountSyncPage;

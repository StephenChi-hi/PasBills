"use client";

import { BalanceCard } from "./home/BalanceCard";
import { CashFlowCard } from "./home/CashFlowCard";
import { TransactionListCard } from "./home/TransactionListCard";
import { AccountsCard } from "./home/AccountsCard";
import { BusinessesCard } from "./home/BusinessesCard";
import { CashFlowDynamicsCard } from "./home/CashFlowDynamicsCard";
import { CurrencySwitcher } from "./home/CurrencySwitcher";
import { BottomNav } from "./home/BottomNav";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pb-24">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with User Info */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Welcome back,              Here's your financial overview.
            </p>
            <p className=" text-[12px] text-zinc-700 dark:text-zinc-500">
              {" "}
              {user?.email ? ` ${user.email}` : ""}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Takes 2 columns on large screens */}
          <div className="space-y-6 lg:col-span-2">
            {/* Balance Card */}
            <BalanceCard liquidBalance={24500.5} netWorth={156230.75} />

            {/* Cash Flow Card */}
            <CashFlowCard inflow={8500.75} outflow={3200.25} />

            {/* Transaction List Card */}
            <TransactionListCard />
          </div>

          {/* Right Column - Takes 1 column on large screens */}
          <div className="space-y-6">
            {/* Accounts Card */}
            <AccountsCard />

            {/* Businesses Card */}
            <BusinessesCard />
          </div>
        </div>

        {/* Cash Flow Dynamics Card - Full Width */}
        <div className="mt-8">
          <CashFlowDynamicsCard />
        </div>

        {/* Currency Switcher */}
        <div className="mt-8 flex justify-">
          <CurrencySwitcher />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

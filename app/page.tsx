import { BalanceCard } from "./home/BalanceCard";
import { CashFlowCard } from "./home/CashFlowCard";
import { TransactionListCard } from "./home/TransactionListCard";
import { AccountsCard } from "./home/AccountsCard";
import { BusinessesCard } from "./home/BusinessesCard";
import { CashFlowDynamicsCard } from "./home/CashFlowDynamicsCard";
import { BottomNav } from "./home/BottomNav";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pb-24">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Welcome back! Here's your financial overview.
          </p>
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
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

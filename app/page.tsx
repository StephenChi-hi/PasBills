"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { BalanceCard } from "./home/BalanceCard";
import { CashFlowCard } from "./home/CashFlowCard";
import { TransactionListCard } from "./home/TransactionListCard";
import { AccountsCard } from "./home/AccountsCard";
import { BusinessesCard } from "./home/BusinessesCard";
import { LoansCard } from "./home/LoansCard";
import { TangibleAssetsCard } from "./home/TangibleAssetsCard";
import { CashFlowDynamicsCard } from "./home/CashFlowDynamicsCard";
import { CashFlowChart } from "./home/CashFlowChart";
import { CurrencySwitcher } from "./home/CurrencySwitcher";
import { ResetDataButton } from "./home/ResetDataButton";
import { DownloadTransactionsButton } from "./home/DownloadTransactionsButton";
import { BottomNav } from "./home/BottomNav";
import { MobileMenu } from "./home/MobileMenu";
import { AITimelineButton } from "./home/AITimelineButton";
import { CalculateTaxButton } from "./home/CalculateTaxButton";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { HandCoins, Loader2 } from "lucide-react";

const cardTransition = (index: number) => ({
  delay: index * 0.1,
  duration: 0.5,
  type: "tween" as const,
});

export default function Home() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  // Protect the route - redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  // Refs for each section
  const accountsRef = useRef<HTMLDivElement>(null);
  const businessesRef = useRef<HTMLDivElement>(null);
  const loansRef = useRef<HTMLDivElement>(null);
  const tangibleAssetsRef = useRef<HTMLDivElement>(null);
  const cashFlowDynamicsRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigate = (section: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      accounts: accountsRef,
      businesses: businessesRef,
      loans: loansRef,
      "tangible-assets": tangibleAssetsRef,
      "cash-flow-dynamics": cashFlowDynamicsRef,
    };

    const targetRef = refs[section];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect happens in useEffect, but render nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50  dark:bg-gradient-to-br dark:from-zinc-950 dark:to-green-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with User Info and Mobile Menu Button */}
        <div className="mb-8 flex w-full">
          <div className="flex w-full flex-col">
            <div className="flex items-start justify-between ">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Dashboard
              </h1>
              {/* Mobile Menu Button */}
              <MobileMenu
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                toolsComponents={{
                  CurrencySwitcher,
                  DownloadTransactionsButton,
                  AITimelineButton,
                  CalculateTaxButton,
                  ResetDataButton,
                }}
              />
            </div>

            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Welcome back, Here's your financial overview.
            </p>
            <p className=" text-[12px] text-zinc-700 dark:text-zinc-500">
              {" "}
              {user?.email ? ` ${user.email}` : ""}
            </p>
          </div>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Takes 2 columns on large screens */}
          <div className="space-y-6 lg:col-span-2">
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={cardTransition(0)}
            >
              <BalanceCard liquidBalance={0} netWorth={0} />
            </motion.div>

            {/* Cash Flow Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={cardTransition(1)}
            >
              <CashFlowCard inflow={0} outflow={0} />
            </motion.div>

            {/* Transaction List Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={cardTransition(2)}
            >
              <TransactionListCard />
            </motion.div>
          </div>

          {/* Right Column - Takes 1 column on large screens */}
          <div className="space-y-6">
            {/* Accounts Card */}
            <div ref={accountsRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={cardTransition(3)}
              >
                <AccountsCard />
              </motion.div>
            </div>

            {/* Businesses Card */}
            <div ref={businessesRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={cardTransition(4)}
              >
                <BusinessesCard />
              </motion.div>
            </div>

            {/* Loans Card */}
          </div>
        </div>
        {/* Cash Flow Chart - Full Width */}
        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={cardTransition(7)}
          >
            <CashFlowChart />
          </motion.div>
        </div>
        <div className=" my-8" ref={loansRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={cardTransition(5)}
          >
            <LoansCard />
          </motion.div>
        </div>

        {/* Tangible Assets Card */}
        <div className="my-8" ref={tangibleAssetsRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={cardTransition(6)}
          >
            <TangibleAssetsCard />
          </motion.div>
        </div>

        {/* Cash Flow Dynamics Card - Full Width */}
        <div className="mt-8" ref={cashFlowDynamicsRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={cardTransition(8)}
          >
            <CashFlowDynamicsCard />
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

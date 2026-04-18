"use client";

import { useRef, useEffect, useState } from "react";
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
import { TokenNavButton } from "./home/TokenNavButton";
import { CalculateTaxButton } from "./home/CalculateTaxButton";
import { AITimelineModal } from "./home/modals/AITimelineModal";
import { TokenPurchaseModal } from "./home/modals/TokenPurchaseModal";
import { ExportTransactionsModal } from "./home/modals/ExportTransactionsModal";
import { CalculateTaxModal } from "./home/modals/CalculateTaxModal";
import { ResetDataModal } from "./home/modals/ResetDataModal";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { HandCoins, Loader2 } from "lucide-react";
import { useDashboardData } from "@/lib/hooks/useDashboardData";

const cardTransition = (index: number) => ({
  delay: index * 0.1,
  duration: 0.5,
  type: "tween" as const,
});

export default function Home() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const { data: dashboardData, loading: dashboardLoading } = useDashboardData(
    user?.id,
  );

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

  // State for AI Timeline Modal
  const [showAIModal, setShowAIModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

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

  // Create accounting summary for AI analysis
  const getAccountingSummary = () => {
    const transactions = dashboardData.transactions || [];
    const categories = dashboardData.categories || [];

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    const incomeByCategory: Record<string, number> = {};

    transactions.forEach((transaction: any) => {
      const amount = parseFloat(transaction.amount) || 0;
      const categoryId = transaction.category_id;
      const category = categories.find((c: any) => c.id === categoryId);
      const categoryName = category?.name || "Uncategorized";

      if (transaction.type === "expense") {
        totalExpenses += amount;
        expensesByCategory[categoryName] =
          (expensesByCategory[categoryName] || 0) + amount;
      } else if (transaction.type === "income") {
        totalIncome += amount;
        incomeByCategory[categoryName] =
          (incomeByCategory[categoryName] || 0) + amount;
      }
    });

    // Sort and get top categories
    const topExpenseCategories = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / totalExpenses) * 100,
      }));

    const topIncomeCategories = Object.entries(incomeByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / totalIncome) * 100,
      }));

    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      balance: dashboardData.balance?.liquid_balance || 0,
      topExpenseCategories,
      topIncomeCategories,
    };
  };

  return (
    <div className="min-h-screen bg-zinc-50  dark:bg-gradient-to-br dark:from-zinc-950 dark:to-green-900">
      {/* Fixed Navbar with Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-900/10 border-b border-zinc-200/50 dark:border-zinc-700/50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          {/* Token Nav Button - Desktop */}
          {/* <div className="hidden md:block">
            <TokenNavButton onClick={() => setShowTokenModal(true)} />
          </div> */}
          {/* Mobile Menu Button */}
          <MobileMenu
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onAITimelineClick={() => setShowAIModal(true)}
            onTokenClick={() => setShowTokenModal(true)}
            onExportTransactionsClick={() => setShowExportModal(true)}
            onCalculateTaxClick={() => setShowTaxModal(true)}
            onResetDataClick={() => setShowResetModal(true)}
            toolsComponents={{
              CurrencySwitcher,
              TokenNavButton,
              DownloadTransactionsButton,
              AITimelineButton,
              CalculateTaxButton,
              ResetDataButton,
            }}
          />
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-36 sm:px-6 lg:px-8">
        {/* DEBUG: Temporary Data Status Panel */}
        <div className="mb-6 hidden rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
          <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200">
            <strong>DEBUG:</strong> Accounts:{" "}
            {dashboardData.accounts?.length || 0} | Transactions:{" "}
            {dashboardData.transactions?.length || 0} | Categories:{" "}
            {dashboardData.categories?.length || 0} | Businesses:{" "}
            {dashboardData.businesses?.length || 0} | Loans:{" "}
            {dashboardData.loans?.length || 0} | Loading:{" "}
            {dashboardLoading ? "Yes" : "No"}
          </p>
        </div>
        {/* Tips: Temporary Data Status Panel */}

        {/* Header with User Info and Mobile Menu Button */}
        <div className="mb-8 flex w-full">
          <div className="flex w-full flex-col">
            <p className="text-zinc-600 dark:text-zinc-400">
              Welcome back, Here's your financial overview.
            </p>
            <p className="text-[12px] text-zinc-700 dark:text-zinc-500">
              {user?.email ? ` ${user.email}` : ""}
            </p>
          </div>
        </div>

        {/* Loading state for dashboard */}
        {dashboardLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Loading dashboard...
              </p>
            </div>
          </div>
        ) : (
          <>
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
                  <BalanceCard
                    liquidBalance={dashboardData.balance?.liquid_balance || 0}
                    netWorth={dashboardData.balance?.net_worth || 0}
                  />

                  <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                    <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200">
                      <strong>💡 Quick Tip:</strong> Seeing where your money is
                      going is the first step to controlling it. Track your
                      transactions regularly and review your cash flow to
                      identify spending patterns.
                    </p>
                  </div>
                </motion.div>

                {/* Cash Flow Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={cardTransition(1)}
                >
                  <CashFlowCard
                    inflow={dashboardData.cashFlow?.total_inflow || 0}
                    outflow={dashboardData.cashFlow?.total_outflow || 0}
                  />
                </motion.div>

                {/* Transaction List Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={cardTransition(2)}
                >
                  <TransactionListCard
                    transactions={dashboardData.transactions}
                    accounts={dashboardData.accounts}
                    categories={dashboardData.categories}
                  />
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
                    <AccountsCard accounts={dashboardData.accounts} />
                  </motion.div>
                </div>

                {/* Businesses Card */}
                <div ref={businessesRef}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={cardTransition(4)}
                  >
                    <BusinessesCard businesses={dashboardData.businesses} />
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
                <CashFlowChart chartData={dashboardData.chartData} />
              </motion.div>
            </div>
            <div className=" my-8" ref={loansRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={cardTransition(5)}
              >
                <LoansCard loans={dashboardData.loans} />
              </motion.div>
            </div>

            {/* Tangible Assets Card */}
            <div className="my-8" ref={tangibleAssetsRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={cardTransition(6)}
              >
                <TangibleAssetsCard
                  assets={dashboardData.tangibleAssets}
                  accounts={dashboardData.accounts}
                />
              </motion.div>
            </div>

            {/* Cash Flow Dynamics Card - Full Width */}
            <div className="mt-8" ref={cashFlowDynamicsRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={cardTransition(8)}
              >
                <CashFlowDynamicsCard
                  categories={dashboardData.categories}
                  transactions={dashboardData.transactions}
                />
              </motion.div>
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Modals */}
      {/* AI Timeline Modal */}
      <AITimelineModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onOpenTokenModal={() => {
          setShowAIModal(false);
          setShowTokenModal(true);
        }}
        transactions={dashboardData.transactions}
        accountingSummary={getAccountingSummary()}
      />

      {/* Token Purchase Modal */}
      <TokenPurchaseModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />

      {/* Export Transactions Modal */}
      <ExportTransactionsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Calculate Tax Modal */}
      <CalculateTaxModal
        isOpen={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        onOpenTokenModal={() => setShowTokenModal(true)}
        businesses={dashboardData.businesses}
      />

      {/* Reset Data Modal */}
      <ResetDataModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </div>
  );
}

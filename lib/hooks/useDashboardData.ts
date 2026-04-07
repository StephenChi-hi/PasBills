import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTransactionStore } from "@/lib/stores/transaction-store";

export interface DashboardData {
  balance: { liquid_balance: number; net_worth: number } | null;
  cashFlow: { total_inflow: number; total_outflow: number } | null;
  transactions: any[];
  accounts: any[];
  categories: any[];
  businesses: any[];
  loans: any[];
  tangibleAssets: any[];
  chartData: any[];
}

export function useDashboardData(userId: string | undefined) {
  const [data, setData] = useState<DashboardData>({
    balance: null,
    cashFlow: null,
    transactions: [],
    accounts: [],
    categories: [],
    businesses: [],
    loans: [],
    tangibleAssets: [],
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const { refetchTrigger } = useTransactionStore();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log(
      "🔄 Centralized fetch triggered, refetchTrigger =",
      refetchTrigger,
    );

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch all data in parallel
        const [
          balanceRes,
          cashFlowRes,
          accountsRes,
          transactionsRes,
          categoriesRes,
          businessesRes,
          loansRes,
          tangibleAssetsRes,
        ] = await Promise.all([
          // Balance (pre-calculated from DB triggers)
          supabase
            .from("balance")
            .select("liquid_balance, net_worth")
            .eq("user_id", userId)
            .single(),

          // Cash flow summary (pre-calculated from DB triggers)
          supabase
            .from("cash_flow_summary")
            .select("total_inflow, total_outflow")
            .eq("user_id", userId)
            .single(),

          // Accounts
          supabase
            .from("accounts")
            .select("id, name, type, balance, currency")
            .eq("user_id", userId),

          // Transactions with their categories
          supabase
            .from("transactions")
            .select(
              "id, type, description, amount, category_id, from_account_id, to_account_id, business_id, transaction_date",
            )
            .eq("user_id", userId)
            .order("transaction_date", { ascending: false })
            .limit(100),

          // Categories
          supabase
            .from("categories")
            .select("id, name, icon, type, category_type")
            .or(`user_id.is.null,user_id.eq.${userId}`),

          // Businesses
          supabase.from("businesses").select("*").eq("user_id", userId),

          // Loans
          supabase.from("loans").select("*").eq("user_id", userId),

          // Tangible assets (transactions with tangible_assets = true)
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", userId)
            .eq("tangible_assets", true),
        ]);

        // Transform transactions to match component expectations (camelCase)
        const transformedTransactions = (transactionsRes.data || []).map(
          (tx: any) => ({
            id: tx.id,
            description: tx.description,
            amount: tx.amount,
            type: tx.type,
            categoryId: tx.category_id,
            from: tx.from_account_id,
            to: tx.to_account_id,
            businessId: tx.business_id,
            date: tx.transaction_date,
            isInternal: tx.from_account_id && tx.to_account_id,
          }),
        );

        // Transform transactions into chart data (aggregated by day)
        const chartDataMap = new Map<
          string,
          { income: number; expense: number }
        >();
        (transactionsRes.data || []).forEach((tx: any) => {
          const date = tx.transaction_date; // YYYY-MM-DD format
          const existing = chartDataMap.get(date) || { income: 0, expense: 0 };

          if (tx.type === "income") {
            existing.income += tx.amount;
          } else {
            existing.expense += tx.amount;
          }
          chartDataMap.set(date, existing);
        });

        // Convert chart data map to array format
        const transformedChartData = Array.from(chartDataMap.entries())
          .map(([date, { income, expense }]) => ({
            date,
            day: parseInt(date.split("-")[2]),
            income,
            expense,
            net: income - expense,
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        // Transform tangible assets similarly
        const transformedAssets = (tangibleAssetsRes.data || []).map(
          (asset: any) => ({
            id: asset.id,
            description: asset.description,
            amount: asset.amount,
            currency: asset.currency || "NGN",
            date: asset.transaction_date,
            transactionType: asset.is_business ? "business" : "personal",
            businessId: asset.business_id,
            category: "Tangible Asset",
          }),
        );

        // Transform loans to match component expectations (camelCase)
        const transformedLoans = (loansRes.data || []).map((loan: any) => ({
          id: loan.id,
          loanType: loan.loan_type,
          counterpartyName: loan.counterparty_name,
          principalAmount: loan.principal_amount,
          interestRate: loan.interest_rate,
          totalPaid: loan.amount_paid || 0,
          status: loan.status,
          borrowedDate: loan.borrowed_date,
          dueDate: loan.due_date,
          currency: loan.currency || "NGN",
          description: loan.description,
          accountId: loan.account_id,
          transactionType: loan.transaction_type,
          businessId: loan.business_id,
          amount: loan.principal_amount - (loan.amount_paid || 0),
          account: "", // Will be filled from accounts map if available
        }));

        console.log("✅ All data fetched successfully");
        console.log("💰 Balance:", balanceRes.data, balanceRes.error);
        console.log("💵 Cash Flow:", cashFlowRes.data, cashFlowRes.error);
        console.log(
          "📝 Transactions:",
          transformedTransactions.length,
          transactionsRes.error,
        );
        console.log(
          "🏦 Accounts:",
          accountsRes.data?.length,
          accountsRes.error,
        );
        console.log(
          "📂 Categories:",
          categoriesRes.data?.length,
          categoriesRes.error,
        );
        console.log(
          "🏢 Businesses:",
          businessesRes.data?.length,
          businessesRes.error,
        );
        console.log("💳 Loans:", transformedLoans.length, loansRes.error);
        console.log(
          "🏠 Tangible Assets:",
          transformedAssets.length,
          tangibleAssetsRes.error,
        );
        console.log("📈 Chart Data:", transformedChartData.length, "days");

        setData({
          balance: balanceRes.data || null,
          cashFlow: cashFlowRes.data || null,
          transactions: transformedTransactions,
          accounts: accountsRes.data || [],
          categories: categoriesRes.data || [],
          businesses: businessesRes.data || [],
          loans: transformedLoans,
          tangibleAssets: transformedAssets,
          chartData: transformedChartData,
        });
      } catch (err) {
        console.error("❌ Error fetching dashboard data:", err);
        setData({
          balance: null,
          cashFlow: null,
          transactions: [],
          accounts: [],
          categories: [],
          businesses: [],
          loans: [],
          tangibleAssets: [],
          chartData: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId, refetchTrigger]);

  return { data, loading };
}

"use client";

import { useState, useEffect } from "react";
import { Plus, Package, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";

interface TangibleAsset {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  transactionType: "personal" | "business";
  businessId?: string;
  businessName?: string;
  category: string;
}

interface TangibleAssetsCardProps {
  assets?: TangibleAsset[];
}

interface Business {
  id: string;
  name: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

export function TangibleAssetsCard({
  assets: propAssets,
}: TangibleAssetsCardProps) {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<TangibleAsset[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<TangibleAsset | null>(
    null,
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [showSoldInput, setShowSoldInput] = useState(false);
  const [saleAmount, setSaleAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { currentCurrency } = useCurrency();
  const { refetchTrigger, triggerRefetch } = useTransactionStore();
  const { user } = useAuth();

  // Fetch tangible assets from database
  useEffect(() => {
    console.log(
      "🔄 TangibleAssetsCard useEffect triggered, refetchTrigger =",
      refetchTrigger,
    );
    const fetchTangibleAssets = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        console.log("Fetching tangible assets for user:", user.id);

        // Fetch transactions where tangible_assets = true
        const { data: txData, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .eq("tangible_assets", true)
          .order("transaction_date", { ascending: false });

        if (error) {
          console.error("Error fetching tangible assets:", error);
          setLoading(false);
          return;
        }

        // Fetch businesses for mapping
        const { data: businessesData } = await supabase
          .from("businesses")
          .select("id, name")
          .eq("user_id", user.id);

        const businessMap = (businessesData || []).reduce(
          (acc, b) => ({ ...acc, [b.id]: b }),
          {} as Record<string, Business>,
        );

        // Transform transactions to TangibleAsset interface
        const transformedAssets: TangibleAsset[] = (txData || []).map(
          (tx: any) => {
            const business = tx.business_id
              ? businessMap[tx.business_id]
              : null;
            const isPersonal = !tx.is_business;

            return {
              id: tx.id,
              description: tx.description,
              amount: tx.amount,
              currency: "NGN",
              date: tx.transaction_date,
              transactionType: isPersonal ? "personal" : "business",
              businessId: tx.business_id,
              businessName: business?.name,
              category: tx.type === "income" ? "Asset" : "Purchase",
            };
          },
        );

        console.log("Transformed tangible assets:", transformedAssets.length);
        setAssets(transformedAssets);
      } catch (err) {
        console.error("Error fetching tangible assets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTangibleAssets();
  }, [refetchTrigger]);

  // Fetch accounts when modal opens
  useEffect(() => {
    if (!selectedAsset || !user) return;

    const fetchAccounts = async () => {
      try {
        const supabase = createClient();
        const { data: accountsData } = await supabase
          .from("accounts")
          .select("id, name, type")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (accountsData && accountsData.length > 0) {
          setAccounts(accountsData);
          setSelectedAccountId(accountsData[0].id); // Set first account as default
        }
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };

    fetchAccounts();
  }, [selectedAsset, user]);

  const personalAssets = assets.filter((a) => a.transactionType === "personal");
  const businessAssets = assets.filter((a) => a.transactionType === "business");

  // Group business assets by business
  const businessGrouped = businessAssets.reduce(
    (acc, asset) => {
      const businessKey = asset.businessName || "Unknown Business";
      if (!acc[businessKey]) {
        acc[businessKey] = [];
      }
      acc[businessKey].push(asset);
      return acc;
    },
    {} as Record<string, TangibleAsset[]>,
  );

  const formatCurrency = (value: number) => {
    const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
    if (!currency) return value.toFixed(2);

    // Database stores amount in NGN, convert to selected currency
    // NGN → USD: divide by NGN rate
    // USD → selected currency: multiply by currency rate
    const ngnRate = CURRENCIES.NGN.rateToUSD; // 1550
    const valueInUSD = value / ngnRate;
    const convertedValue = valueInUSD * currency.rateToUSD;

    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedValue);

    return `${currency.symbol}${formatted}`;
  };

  const handleSaleTransaction = async () => {
    if (!selectedAsset || !saleAmount || !user || !selectedAccountId) return;

    setSubmitting(true);
    try {
      const supabase = createClient();

      // Determine category based on asset type
      let categoryName = "Item Sales"; // personal
      if (selectedAsset.transactionType === "business") {
        categoryName = "Sales";
      }

      // Fetch the category ID
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id")
        .eq("name", categoryName)
        .eq("type", "income")
        .eq(
          "category_type",
          selectedAsset.transactionType === "business"
            ? "business"
            : "personal",
        )
        .single();

      if (!categoryData) {
        console.error("Category not found");
        setSubmitting(false);
        return;
      }

      // Fetch current net_worth and deduct the initial asset amount
      const { data: balanceData } = await supabase
        .from("balance")
        .select("net_worth")
        .eq("user_id", user.id)
        .single();

      if (balanceData) {
        const newNetWorth = balanceData.net_worth - selectedAsset.amount;
        const { error: updateNetWorthError } = await supabase
          .from("balance")
          .update({ net_worth: newNetWorth })
          .eq("user_id", user.id);

        if (updateNetWorthError) {
          console.error("Error deducting from net_worth:", updateNetWorthError);
        }
      }

      // Update the original tangible asset transaction to set tangible_assets = false
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ tangible_assets: false })
        .eq("id", selectedAsset.id);

      if (updateError) {
        console.error(
          "Error updating tangible asset transaction:",
          updateError,
        );
        setSubmitting(false);
        return;
      }

      // Create income transaction for the sale
      const { error: insertError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "income",
          description: `Sold: ${selectedAsset.description}`,
          amount: parseFloat(saleAmount),
          category_id: categoryData.id,
          from_account_id: null,
          to_account_id: selectedAccountId,
          business_id: selectedAsset.businessId || null,
          is_business: selectedAsset.transactionType === "business",
          tangible_assets: false,
          transaction_date: new Date().toISOString().split("T")[0],
        });

      if (insertError) {
        console.error("Error creating sale transaction:", insertError);
      } else {
        // Reset modal state
        setSelectedAsset(null);
        setShowSoldInput(false);
        setSaleAmount("");
        setSelectedAccountId("");
        // Trigger refetch
        triggerRefetch();
      }
    } catch (err) {
      console.error("Error processing sale:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedAsset(null);
    setShowSoldInput(false);
    setSaleAmount("");
    setSelectedAccountId("");
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          Tangible Assets
        </h3>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading tangible assets...
            </p>
          </div>
        ) : assets.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No tangible assets recorded
            </p>
          </div>
        ) : (
          <>
            {/* Personal Assets (Left) */}
            <div>
              <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-4">
                Personal
              </h4>
              {personalAssets.length > 0 ? (
                <div className="space-y-3">
                  {personalAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className="flex flex-col gap-2 rounded-md border p-3 transition-colors border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        {/* Left side: Icon and details */}
                        <div className="flex flex-1 items-start gap-3 min-w-0">
                          {/* Asset Icon Badge */}
                          <div className="inline-block font-medium px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                            <Package className="h-5 w-5" />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate mb-1">
                              {asset.description}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {asset.category}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                              {new Date(asset.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="ml-2 text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            {formatCurrency(asset.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No personal tangible assets
                  </p>
                </div>
              )}
            </div>

            {/* Business Assets (Right) */}
            <div>
              <h4 className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide mb-4">
                Business
              </h4>
              {businessAssets.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(businessGrouped).map(
                    ([businessName, items]) => (
                      <div key={businessName}>
                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 ml-1">
                          {businessName}
                        </p>
                        <div className="space-y-3">
                          {items.map((asset) => (
                            <div
                              key={asset.id}
                              onClick={() => setSelectedAsset(asset)}
                              className="flex flex-col gap-2 rounded-md border p-3 transition-colors border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                              <div className="flex items-start justify-between">
                                {/* Left side: Icon and details */}
                                <div className="flex flex-1 items-start gap-3 min-w-0">
                                  {/* Asset Icon Badge */}
                                  <div className="inline-block font-medium px-2 py-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                                    <Package className="h-5 w-5" />
                                  </div>

                                  {/* Details */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate mb-1">
                                      {asset.description}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                      {asset.category}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                      {new Date(
                                        asset.date,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {/* Amount */}
                                <div className="ml-2 text-right flex-shrink-0">
                                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                    {formatCurrency(asset.amount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No business tangible assets
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Asset Details Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 max-w-sm w-full"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </button>

              {/* Asset Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  Asset Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold">
                      Description
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                      {selectedAsset.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold">
                      Amount
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                      {formatCurrency(selectedAsset.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold">
                      Date
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                      {new Date(selectedAsset.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold">
                      Type
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium capitalize">
                      {selectedAsset.transactionType}
                      {selectedAsset.businessName &&
                        ` - ${selectedAsset.businessName}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sale Input Section */}
              {!showSoldInput ? (
                <button
                  onClick={() => setShowSoldInput(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Sold
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold block mb-2">
                      Sale Amount ({currentCurrency})
                    </label>
                    <input
                      type="number"
                      value={saleAmount}
                      onChange={(e) => setSaleAmount(e.target.value)}
                      placeholder="Enter sale amount"
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold block mb-2">
                      Deposit To Account
                    </label>
                    {accounts.length > 0 ? (
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({account.type})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        No accounts available
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowSoldInput(false);
                        setSaleAmount("");
                      }}
                      className="flex-1 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaleTransaction}
                      disabled={!saleAmount || submitting}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      {submitting ? "Processing..." : "Confirm Sale"}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

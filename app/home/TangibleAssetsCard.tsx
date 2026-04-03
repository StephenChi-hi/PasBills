"use client";

import { useState, useEffect } from "react";
import { Plus, Package } from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { createClient } from "@/lib/supabase/client";

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

export function TangibleAssetsCard({
  assets: propAssets,
}: TangibleAssetsCardProps) {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<TangibleAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<TangibleAsset | null>(
    null,
  );
  const { currentCurrency } = useCurrency();
  const { refetchTrigger } = useTransactionStore();

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

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          Tangible Assets
        </h3>
        <button className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800">
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
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
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  Menu,
  SlidersHorizontal,
  Plus,
  Pencil,
  ChevronRight,
  Library,
  Bitcoin,
} from "lucide-react";
import { supabase } from "@/util/supabase/client";
import AccountEditModal from "./AccountEditModal";

interface Account {
  id: string;
  name: string;
  type: string;
  category: string;
  balance: number;
}

const AccountsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Accounts");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) return;

      const { data, error } = await supabase
        .from("Account")
        .select("*")
        .eq("user_id", userData.user.id);

      if (!error && data) {
        setAccounts(data as Account[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  const handleSaveAccount = () => {
    fetchAccounts();
  };

  const groupedAccounts = accounts.reduce(
    (acc, account) => {
      if (!acc[account.category]) {
        acc[account.category] = [];
      }
      acc[account.category].push(account);
      return acc;
    },
    {} as Record<string, Account[]>,
  );

  const getTotalByCategory = (category: string) => {
    return (
      groupedAccounts[category]?.reduce((sum, acc) => sum + acc.balance, 0) || 0
    );
  };

  const categoryDisplayNames: Record<string, string> = {
    asset: "Cash",
    credit: "Credit",
    investment: "Investments",
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    asset: <Library className="w-8 h-8 text-blue-500" />,
    credit: <Library className="w-8 h-8 text-orange-500" />,
    investment: <Bitcoin className="w-8 h-8 text-purple-500" />,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      {/* --- Top Header --- */}
      <header className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
        <Menu className="w-6 h-6 text-blue-500" />
        <h1 className="text-lg font-bold text-gray-900">Accounts</h1>

        <div className="flex gap-4">
          <SlidersHorizontal className="w-6 h-6 text-blue-500" />
          <Plus className="w-6 h-6 text-blue-500" />
        </div>
      </header>

      {/* --- Networth Section --- */}
      <div className="px-4 py-2 relative overflow-hidden">
        {/* Simple representation of the wave background chart */}
        <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path
              d="M0,80 Q50,90 100,50 T200,20 L200,100 L0,100 Z"
              fill="#0ea5e9"
            />
          </svg>
        </div>

        <div className="flex justify-between items-start mb-2">
          <Paragraph1 className="text-sm font-medium text-gray-900">
            Networth
          </Paragraph1>
          <button className="flex items-center gap-1 px-3 py-1 border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
            1 Year <ChevronRight className="w-3 h-3 rotate-90" />
          </button>
        </div>
        <Paragraph1 className="text-3xl font-bold text-gray-900 mb-6">
          ₦
          {Math.max(
            0,
            accounts.reduce((sum, acc) => sum + acc.balance, 0),
          ).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Paragraph1>
      </div>

      {/* --- Segmented Control (Tabs) --- */}
      <div className="px-4 mb-6">
        <div className="bg-gray-100 p-1 rounded-full flex">
          {["Accounts", "Trends"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- Accounts List --- */}
      <div className="flex-1 px-4 space-y-8 pb-10">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Paragraph1 className="text-gray-500">
              Loading accounts...
            </Paragraph1>
          </div>
        ) : Object.keys(groupedAccounts).length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <Paragraph1 className="text-gray-500">No accounts yet</Paragraph1>
          </div>
        ) : (
          Object.entries(groupedAccounts).map(
            ([category, categoryAccounts]) => (
              <section key={category}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Paragraph1 className="text-lg font-black text-gray-900">
                      {categoryDisplayNames[category] || category}
                    </Paragraph1>
                    <Pencil className="w-4 h-4 text-blue-400" />
                  </div>
                  <Paragraph1 className="text-lg font-black text-gray-900">
                    ₦
                    {getTotalByCategory(category).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    <span className="ml-1">›</span>
                  </Paragraph1>
                </div>

                <div className="space-y-6">
                  {categoryAccounts.map((account) => (
                    <div
                      key={account.id}
                      onClick={() => handleAccountClick(account)}
                    >
                      <AccountItem
                        name={account.name}
                        type={account.type}
                        balance={account.balance.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        icon={
                          categoryIcons[account.category] || categoryIcons.asset
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
            ),
          )
        )}
      </div>

      <AccountEditModal
        isOpen={isModalOpen}
        account={selectedAccount}
        onClose={handleCloseModal}
        onSave={handleSaveAccount}
      />
    </div>
  );
};

// Helper component for each row
interface AccountItemProps {
  name: string;
  type: string;
  balance: string;
  icon: React.ReactNode;
}

const AccountItem: React.FC<AccountItemProps> = ({
  name,
  type,
  balance,
  icon,
}) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg border border-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <Paragraph1 className="text-[16px] font-bold text-gray-900 leading-tight">
          {name}
        </Paragraph1>
        <Paragraph1 className="text-xs text-gray-400 font-medium">
          {type}
        </Paragraph1>
      </div>
    </div>
    <Paragraph1 className="text-[16px] font-bold text-gray-900">
      ₦{balance}
    </Paragraph1>
  </div>
);

export default AccountsPage;

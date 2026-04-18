"use client";

import { useEffect } from "react";
import { Coins, Plus } from "lucide-react";
import { useTokenStore } from "@/lib/tokens/token-store";
import { useAuth } from "@/lib/auth/auth-context";
import { div } from "framer-motion/client";

interface TokenNavButtonProps {
  onClick?: () => void;
}

export function TokenNavButton({ onClick }: TokenNavButtonProps) {
  const { user } = useAuth();
  const { tokens, fetchTokenBalance } = useTokenStore();

  useEffect(() => {
    if (user?.id) {
      fetchTokenBalance(user.id);
    }
  }, [user?.id, fetchTokenBalance]);

  return (
    <div className=" ">
      <h1 className=" text-[12px] mb-1 text-gray-500"> Token balance</h1>{" "}
      <button
        onClick={onClick}
        className="flex w-full justify-between items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/90 dark:to-amber-900/90 hover:from-yellow-100 hover:to-amber-100 dark:hover:from-yellow-800/90 dark:hover:to-amber-800/40 text-yellow-900 dark:text-yellow-100 font-medium transition-all border border-yellow-200 dark:border-yellow-700/50 shadow-sm hover:shadow-md"
      >
        <div className="flex gap-1  w-full items-center">
          {" "}
          <Coins />
          <span className=" font-semibold">{tokens?.balance ?? 0}</span>
        </div>

        <div className=" p-1 bg-amber-200 dark:bg-amber-700/50 rounded-lg text-sm text-yellow-900 dark:text-yellow-100">
          <Plus />
        </div>
      </button>
    </div>
  );
}

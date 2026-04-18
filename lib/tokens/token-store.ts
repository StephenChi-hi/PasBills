import { create } from "zustand";
import { UserTokens } from "./constants";
import { deductTokens, addTokens, getTokenBalance } from "./token-utils";

interface TokenStore {
  tokens: UserTokens | null;
  loading: boolean;
  error: string | null;
  fetchTokenBalance: (userId: string) => Promise<void>;
  deductTokens: (
    userId: string,
    amount: number,
    reason: string,
  ) => Promise<boolean>;
  addTokens: (userId: string, amount: number, reason: string) => Promise<void>;
  reset: () => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  tokens: null,
  loading: false,
  error: null,

  fetchTokenBalance: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await getTokenBalance(userId);
      set({ tokens: data });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  deductTokens: async (userId: string, amount: number, reason: string) => {
    try {
      const updatedTokens = await deductTokens(userId, amount, reason);
      set({ tokens: updatedTokens });
      return true;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to deduct tokens";
      set({ error: errorMsg });
      return false;
    }
  },

  addTokens: async (userId: string, amount: number, reason: string) => {
    set({ loading: true, error: null });
    try {
      const updatedTokens = await addTokens(userId, amount, reason);
      set({ tokens: updatedTokens });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to add tokens";
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => {
    set({ tokens: null, loading: false, error: null });
  },
}));

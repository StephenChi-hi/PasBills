import { create } from "zustand";

interface TransactionStore {
  refetchTrigger: number;
  triggerRefetch: () => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  refetchTrigger: 0,
  triggerRefetch: () =>
    set((state) => {
      const newTrigger = state.refetchTrigger + 1;
      console.log(
        "🔄 Zustand triggerRefetch called, new refetchTrigger value:",
        newTrigger,
      );
      return {
        refetchTrigger: newTrigger,
      };
    }),
}));

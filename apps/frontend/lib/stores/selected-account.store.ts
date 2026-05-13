"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedAccountState {
  accountId: string | null;
  setAccountId: (id: string | null) => void;
}

export const useSelectedAccount = create<SelectedAccountState>()(
  persist(
    (set) => ({
      accountId: null,
      setAccountId: (accountId) => set({ accountId }),
    }),
    { name: "genone-selected-account" }
  )
);

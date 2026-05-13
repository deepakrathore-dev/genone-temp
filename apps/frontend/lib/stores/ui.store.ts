"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarCollapsed: boolean;
  rulesPanelOpen: boolean;
  removalMode: boolean;
  toggleSidebar: () => void;
  toggleRulesPanel: () => void;
  setRulesPanelOpen: (v: boolean) => void;
  setRemovalMode: (v: boolean) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      rulesPanelOpen: true,
      removalMode: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      toggleRulesPanel: () => set({ rulesPanelOpen: !get().rulesPanelOpen }),
      setRulesPanelOpen: (rulesPanelOpen) => set({ rulesPanelOpen }),
      setRemovalMode: (removalMode) => set({ removalMode }),
    }),
    { name: "genone-ui" }
  )
);

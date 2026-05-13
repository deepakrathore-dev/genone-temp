"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@genone/types";

interface UiState {
  sidebarCollapsed: boolean;
  role: UserRole;
  toggleSidebar: () => void;
  setRole: (r: UserRole) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      role: "SUPER_ADMIN",
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setRole: (role) => set({ role }),
    }),
    { name: "genone-admin-ui" }
  )
);

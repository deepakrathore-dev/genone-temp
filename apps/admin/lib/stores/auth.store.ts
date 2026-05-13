"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@genone/types";

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

interface AuthState {
  session: AdminSession | null;
  signIn: (s: AdminSession) => void;
  signOut: () => void;
  setRole: (role: UserRole) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      signIn: (session) => set({ session }),
      signOut: () => set({ session: null }),
      setRole: (role) => {
        const s = get().session;
        if (s) set({ session: { ...s, role } });
      },
    }),
    { name: "genone-admin-auth" }
  )
);

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthSession } from "../lib/api";

type AuthState = {
  session?: AuthSession;
  _hydrated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: undefined,
      _hydrated: false,
      setSession: (session) => set({ session }),
      logout: () => set({ session: undefined })
    }),
    {
      name: "leilportal-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ _hydrated: true });
      }
    }
  )
);

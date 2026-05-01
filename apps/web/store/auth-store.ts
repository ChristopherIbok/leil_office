"use client";

import { create } from "zustand";
import type { AuthSession } from "../lib/api";

const STORAGE_KEY = "leilportal-session";

function loadSession(): AuthSession | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
}

type AuthState = {
  session?: AuthSession;
  setSession: (session: AuthSession) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: loadSession(),
  setSession: (session) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
    set({ session });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    set({ session: undefined });
  }
}));

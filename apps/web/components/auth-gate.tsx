"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";

export function AuthGate() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const hydrated = useAuthStore((state) => state._hydrated);

  useEffect(() => {
    if (hydrated && !session) {
      router.replace("/login");
    }
  }, [router, session, hydrated]);

  return null;
}

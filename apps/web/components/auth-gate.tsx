"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";

export function AuthGate() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    if (session === undefined) {
      router.replace("/login");
    }
  }, [router, session]);

  return null;
}

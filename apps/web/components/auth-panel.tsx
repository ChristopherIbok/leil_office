"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { login, register } from "../lib/api";
import { useAuthStore } from "../store/auth-store";

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const email = String(formData.get("email"));
      const password = String(formData.get("password"));
      const session =
        mode === "signup"
          ? await register(String(formData.get("name")), email, password, String(formData.get("role")))
          : await login(email, password);
      setSession(session);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex flex-col justify-between bg-ink px-8 py-8 text-white">
        <div className="text-xl font-bold">LEILPORTAL</div>
        <div className="max-w-xl py-12">
          <h1 className="text-4xl font-semibold tracking-normal">Secure collaboration for modern service teams.</h1>
          <p className="mt-4 text-sm leading-6 text-white/75">Projects, messages, documents, time, and billing in one role-aware workspace.</p>
        </div>
        <p className="text-xs text-white/60">Built for admins, team members, and client collaborators.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit(new FormData(event.currentTarget));
          }}
          className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-soft"
        >
          <h2 className="text-2xl font-semibold">{mode === "login" ? "Log in" : "Create account"}</h2>
          <div className="mt-6 space-y-4">
            {mode === "signup" && <Field name="name" label="Name" placeholder="Ada Lovelace" />}
            <Field name="email" label="Email" placeholder="you@company.com" type="email" />
            <Field name="password" label="Password" placeholder="At least 10 characters" type="password" />
            {mode === "signup" && (
              <label className="block text-sm font-medium">
                Role
                <select name="role" className="mt-2 h-11 w-full rounded-md border border-line px-3">
                  <option value="TEAM_MEMBER">Team Member</option>
                  <option value="CLIENT">Client</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
            )}
          </div>
          {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Working..." : mode === "login" ? "Log in" : "Sign up"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input name={name} type={type} placeholder={placeholder} required className="mt-2 h-11 w-full rounded-md border border-line px-3 outline-none focus:border-brand" />
    </label>
  );
}

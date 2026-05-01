"use client";

import { useState } from "react";
import { User, Mail, Shield, Save } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { Shell } from "../../components/shell";
import { useAuthStore } from "../../store/auth-store";
import { apiFetch } from "../../lib/api";

export default function ProfilePage() {
  const session = useAuthStore((state) => state.session);
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave() {
    if (!session) return;

    setSaving(true);
    setMessage(null);

    try {
      await apiFetch(`/users/${session.user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name })
      }, session.accessToken);
      
      useAuthStore.getState().setSession({
        ...session,
        user: { ...session.user, name }
      });

      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile" });
    }

    setSaving(false);
  }

  return (
    <>
      <AuthGate />
      <Shell title="Profile">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-md border border-line bg-white p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-brand flex items-center justify-center text-white text-2xl font-bold">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{session?.user?.name}</h2>
                <p className="text-sm text-muted">{session?.user?.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <User className="h-4 w-4" />
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-line px-3 py-2"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-md border border-line px-3 py-2 bg-gray-50"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Shield className="h-4 w-4" />
                  Role
                </label>
                <input
                  type="text"
                  value={session?.user?.role || ""}
                  disabled
                  className="w-full rounded-md border border-line px-3 py-2 bg-gray-50"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {message.text}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </Shell>
    </>
  );
}
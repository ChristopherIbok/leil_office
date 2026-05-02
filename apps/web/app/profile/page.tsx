"use client";

import { useState } from "react";
import { User, Mail, Shield, Save, Lock } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { Shell } from "../../components/shell";
import { useAuthStore } from "../../store/auth-store";
import { apiFetch } from "../../lib/api";

export default function ProfilePage() {
  const session = useAuthStore((state) => state.session);
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    setProfileMsg(null);
    try {
      await apiFetch(`/users/${session.user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name })
      }, session.accessToken);
      useAuthStore.getState().setSession({ ...session, user: { ...session.user, name } });
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
    } catch {
      setProfileMsg({ type: "error", text: "Failed to update profile." });
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    if (!session) return;
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    setChangingPw(true);
    setPwMsg(null);
    try {
      await apiFetch("/auth/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword })
      }, session.accessToken);
      setPwMsg({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to change password." });
    }
    setChangingPw(false);
  }

  return (
    <>
      <AuthGate />
      <Shell title="Profile">
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="rounded-md border border-line bg-white p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-brand flex items-center justify-center text-white text-2xl font-bold">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{session?.user?.name}</h2>
                <p className="text-sm text-muted">{session?.user?.role?.replace("_", " ")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <User className="h-4 w-4" />Name
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
                  <Mail className="h-4 w-4" />Email
                </label>
                <input
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="w-full rounded-md border border-line px-3 py-2 bg-surface text-muted"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Shield className="h-4 w-4" />Role
                </label>
                <input
                  type="text"
                  value={session?.user?.role?.replace("_", " ") || ""}
                  disabled
                  className="w-full rounded-md border border-line px-3 py-2 bg-surface text-muted"
                />
              </div>

              {profileMsg && (
                <div className={`p-3 rounded-md text-sm ${profileMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {profileMsg.text}
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

          <div className="rounded-md border border-line bg-white p-6">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <Lock className="h-4 w-4" />Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-line px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-line px-3 py-2"
                  placeholder="Min 8 characters"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-line px-3 py-2"
                />
              </div>

              {pwMsg && (
                <div className={`p-3 rounded-md text-sm ${pwMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {pwMsg.text}
                </div>
              )}

              <button
                onClick={handleChangePassword}
                disabled={changingPw || !currentPassword || !newPassword || !confirmPassword}
                className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {changingPw ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      </Shell>
    </>
  );
}

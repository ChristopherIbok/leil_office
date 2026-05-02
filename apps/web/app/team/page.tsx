"use client";

import { useEffect, useState } from "react";
import { Users as UsersIcon, Mail, Trash2 } from "lucide-react";
import { Shell } from "../../components/shell";
import { AuthGate } from "../../components/auth-gate";
import { useAuthStore } from "../../store/auth-store";
import { apiFetch } from "../../lib/api";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function TeamPage() {
  const session = useAuthStore((state) => state.session);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState("TEAM_MEMBER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchTeam();
  }, [session]);

  async function fetchTeam() {
    try {
      const data = await apiFetch("/users", {}, session!.accessToken);
      setMembers(data as TeamMember[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setInviteLoading(true);
    setInviteError(null);
    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ name: inviteName, email: inviteEmail, password: invitePassword, role: inviteRole })
      }, session.accessToken);
      setInviteName("");
      setInviteEmail("");
      setInvitePassword("");
      setInviteRole("TEAM_MEMBER");
      await fetchTeam();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRemove(id: string) {
    if (!session || !confirm("Remove this user?")) return;
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" }, session.accessToken);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const getRoleBadge = (_role: string) => "bg-brand/10 text-brand";

  return (
    <>
      <AuthGate />
      <Shell title="Team">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Team</h1>
          <p className="text-sm text-muted">Manage your team members</p>
        </div>

        <div className="rounded-md border border-line bg-white">
          <div className="border-b border-line px-4 py-3 flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-muted" />
            <h2 className="font-semibold">Team Members</h2>
          </div>
          {loading ? (
            <p className="p-4 text-sm text-muted">Loading...</p>
          ) : members.length === 0 ? (
            <p className="p-4 text-sm text-muted">No team members found</p>
          ) : (
            <div className="divide-y divide-line">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${getRoleBadge(member.role)}`}>
                      {member.role.replace("_", " ")}
                    </span>
                    {session?.user?.role === "ADMIN" && member.id !== session.user.id && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="rounded-md p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {session?.user?.role === "ADMIN" && (
          <div className="mt-6 rounded-md border border-line bg-white p-4">
            <h3 className="font-semibold mb-3">Add New Member</h3>
            <form onSubmit={handleInvite} className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Full name"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email address"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="Temporary password (min 8 chars)"
                required
                minLength={8}
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm"
              >
                <option value="TEAM_MEMBER">Team Member</option>
                <option value="CLIENT">Client</option>
                <option value="ADMIN">Admin</option>
              </select>
              {inviteError && <p className="sm:col-span-2 text-sm text-red-600">{inviteError}</p>}
              <button
                type="submit"
                disabled={inviteLoading}
                className="sm:col-span-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {inviteLoading ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>
        )}
      </Shell>
    </>
  );
}
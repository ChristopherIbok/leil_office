"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UsersRound, Plus, Trash2 } from "lucide-react";
import { Shell } from "../../components/shell";
import { AuthGate } from "../../components/auth-gate";
import { useAuthStore } from "../../store/auth-store";
import { apiFetch } from "../../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEAM_MEMBER" | "CLIENT";
  createdAt: string;
}

export default function AdminPage() {
  const session = useAuthStore((state) => state.session);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "TEAM_MEMBER" as string });
  const [creating, setCreating] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (!session || !isAdmin) return;

    apiFetch("/users", {}, session.accessToken)
      .then((data) => setUsers(data as User[]))
      .catch((err) => console.error("Failed to load users:", err))
      .finally(() => setLoading(false));
  }, [session, isAdmin]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || creating) return;
    setCreating(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(newUser),
      }, session.accessToken);
      setShowForm(false);
      setNewUser({ name: "", email: "", password: "", role: "TEAM_MEMBER" });
      const data = await apiFetch("/users", {}, session.accessToken);
      setUsers(data as User[]);
    } catch (err) {
      console.error("Failed to create user:", err);
    } finally {
      setCreating(false);
    }
  };

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const teamCount = users.filter((u) => u.role === "TEAM_MEMBER").length;
  const clientCount = users.filter((u) => u.role === "CLIENT").length;

  if (!isAdmin) {
    return (
      <Shell title="Access Denied">
        <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center text-red-700">
          You do not have permission to access this page.
        </div>
      </Shell>
    );
  }

  return (
    <>
      <AuthGate />
      <Shell title="Admin Panel">
        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Admins</p>
              <UsersRound className="h-4 w-4 text-brand" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{loading ? "..." : adminCount}</p>
          </section>
          <section className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Team Members</p>
              <UsersRound className="h-4 w-4 text-brand" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{loading ? "..." : teamCount}</p>
          </section>
          <section className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Clients</p>
              <UsersRound className="h-4 w-4 text-brand" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{loading ? "..." : clientCount}</p>
          </section>
        </div>

        <section className="mt-5 rounded-md border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UsersRound className="h-5 w-5 text-brand" />
              <h2 className="font-semibold">User Management</h2>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Create User
            </button>
          </div>

          {showForm && (
            <form onSubmit={createUser} className="mt-4 flex flex-wrap gap-3 rounded-md border border-line p-4">
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="flex-1 min-w-[150px] rounded-md border border-line px-3 py-2 text-sm"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="flex-1 min-w-[150px] rounded-md border border-line px-3 py-2 text-sm"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="flex-1 min-w-[150px] rounded-md border border-line px-3 py-2 text-sm"
                required
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="rounded-md border border-line px-3 py-2 text-sm"
              >
                <option value="TEAM_MEMBER">Team Member</option>
                <option value="CLIENT">Client</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                type="submit"
                disabled={creating}
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-line px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </form>
          )}
          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <p className="py-4 text-sm text-muted">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="py-4 text-sm text-muted">No users found.</p>
            ) : (
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead className="border-b border-line text-muted">
                  <tr>
                    <th className="py-3 font-medium">Name</th>
                    <th className="py-3 font-medium">Email</th>
                    <th className="py-3 font-medium">Role</th>
                    <th className="py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 font-medium">{user.name}</td>
                      <td className="py-3 text-muted">{user.email}</td>
                      <td className="py-3">
                        <span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold text-brand">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mt-5 rounded-md border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h2 className="font-semibold">Security Controls</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {["JWT sessions", "RBAC route guards", "Rate limiting", "Secure uploads"].map((control) => (
              <div key={control} className="rounded-md border border-line p-4 text-sm font-medium">{control}</div>
            ))}
          </div>
        </section>
      </Shell>
    </>
  );
}

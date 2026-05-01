"use client";

import { useEffect, useState } from "react";
import { Users as UsersIcon, Mail } from "lucide-react";
import { Shell } from "../../components/shell";
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

  useEffect(() => {
    if (!session) return;
    fetchTeam();
  }, [session]);

  const fetchTeam = async () => {
    try {
      const data = await apiFetch("/users", {}, session!.accessToken);
      setMembers(data as TeamMember[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700",
      TEAM_MEMBER: "bg-blue-100 text-blue-700",
      CLIENT: "bg-green-100 text-green-700",
    };
    return styles[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <Shell title="Team">
      <div className="p-0">
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
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${getRoleBadge(member.role)}`}>
                    {member.role.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {session?.user?.role === "ADMIN" && (
          <div className="mt-6 rounded-md border border-line bg-white p-4">
            <h3 className="font-semibold mb-3">Invite New Member</h3>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter email address"
                className="flex-1 rounded-md border border-line px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                Send Invite
              </button>
            </form>
          </div>
        )}
      </div>
    </Shell>
  );
}
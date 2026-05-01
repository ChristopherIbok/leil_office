"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Clock, FolderKanban, MessageSquareText, ReceiptText } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { Shell } from "../../components/shell";
import { useAuthStore } from "../../store/auth-store";
import { fetchProjects } from "../../lib/api";

const placeholderNotifications = [
  "Maria uploaded a contract revision.",
  "Jay moved onboarding tasks to review.",
  "Finance generated April retainer invoices."
];

export default function DashboardPage() {
  const session = useAuthStore((state) => state.session);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; status: string; _count?: { tasks: number } }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    setLoading(true);
    fetchProjects(session.accessToken)
      .then((data) => setProjects(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load projects."))
      .finally(() => setLoading(false));
  }, [session]);

  const activeProjects = projects.length;
  const reviewTasks = projects.reduce((count, project) => count + (project._count?.tasks ?? 0), 0);

  return (
    <>
      <AuthGate />
      <Shell title="Dashboard">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active projects" value={loading ? "…" : String(activeProjects)} icon={FolderKanban} />
          <StatCard label="Tasks in review" value={loading ? "…" : String(reviewTasks)} icon={Clock} />
          <StatCard label="Unread messages" value="43" icon={MessageSquareText} />
          <StatCard label="Open invoices" value="$24.8k" icon={ReceiptText} />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-md border border-line bg-white p-5">
            <h2 className="text-base font-semibold">Project Pipeline</h2>
            <div className="mt-4 space-y-3">
              {loading ? (
                <p className="text-sm text-muted">Loading projects…</p>
              ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted">No active projects found.</p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="grid gap-3 rounded-md border border-line p-3 md:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="mt-1 text-sm text-muted">{project.status.toLowerCase().replace(/_/g, " ")}</p>
                    </div>
                    <span className="self-center rounded-md bg-surface px-3 py-1 text-xs font-semibold text-brand">{project.status}</span>
                  </div>
                ))
              )}
            </div>
          </section>
          <section className="rounded-md border border-line bg-white p-5">
            <h2 className="text-base font-semibold">Notifications</h2>
            <div className="mt-4 space-y-4 text-sm">
              {placeholderNotifications.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>
        </div>
      </Shell>
    </>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </section>
  );
}

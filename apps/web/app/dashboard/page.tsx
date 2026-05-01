"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, FolderKanban, Plus, ReceiptText, User } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { Shell } from "../../components/shell";
import { useAuthStore } from "../../store/auth-store";
import { fetchProjects, apiFetch } from "../../lib/api";

interface Project {
  id: string;
  name: string;
  status: string;
  _count?: { tasks: number };
}

interface Invoice {
  id: string;
  amount: string;
  status: string;
}

export default function DashboardPage() {
  const session = useAuthStore((state) => state.session);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    Promise.all([
      fetchProjects(session.accessToken),
      apiFetch("/billing/invoices", {}, session.accessToken).catch(() => [])
    ])
      .then(([projectsData, invoicesData]) => {
        setProjects(projectsData as Project[]);
        setInvoices(invoicesData as Invoice[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  const activeProjects = projects.filter(p => p.status === "ACTIVE").length;
  const pendingInvoices = invoices.filter(i => i.status !== "PAID");
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0);

  return (
    <>
      <AuthGate />
      <Shell title="Dashboard">
        <div className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Welcome back, {session?.user?.name}!</h2>
              <p className="text-sm text-muted">Here's what's happening with your projects</p>
            </div>
            <Link
              href="/projects/new"
              className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active projects" value={loading ? "…" : String(activeProjects)} icon={FolderKanban} href="/projects" />
            <StatCard label="Total projects" value={loading ? "…" : String(projects.length)} icon={FolderKanban} href="/projects" />
            <StatCard label="Pending invoices" value={loading ? "…" : String(pendingInvoices.length)} icon={ReceiptText} href="/billing" />
            <StatCard label="Pending amount" value={loading ? "…" : `$${pendingAmount.toLocaleString()}`} icon={ReceiptText} href="/billing" />
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            <section className="rounded-md border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Recent Projects</h2>
                <Link href="/projects" className="text-sm text-brand hover:underline">View all</Link>
              </div>
              <div className="mt-4 space-y-3">
                {loading ? (
                  <p className="text-sm text-muted">Loading...</p>
                ) : projects.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted mb-4">No projects yet</p>
                    <Link href="/projects/new" className="text-sm text-brand hover:underline">Create your first project</Link>
                  </div>
                ) : (
                  projects.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between rounded-md border border-line p-3 hover:border-brand"
                    >
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-muted">{project._count?.tasks ?? 0} tasks</p>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        project.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                        project.status === "PLANNING" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {project.status}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-md border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Recent Invoices</h2>
                <Link href="/billing" className="text-sm text-brand hover:underline">View all</Link>
              </div>
              <div className="mt-4 space-y-3">
                {loading ? (
                  <p className="text-sm text-muted">Loading...</p>
                ) : invoices.length === 0 ? (
                  <p className="text-sm text-muted">No invoices yet</p>
                ) : (
                  invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between rounded-md border border-line p-3">
                      <div>
                        <p className="font-medium text-sm">#{invoice.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted">${invoice.amount}</p>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        invoice.status === "PAID" ? "bg-green-100 text-green-700" :
                        invoice.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                        invoice.status === "SENT" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </Shell>
    </>
  );
}

function StatCard({ label, value, icon: Icon, href }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; href?: string }) {
  const content = (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </section>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

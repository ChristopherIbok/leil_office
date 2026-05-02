"use client";

import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { Shell } from "../../components/shell";
import { AuthGate } from "../../components/auth-gate";
import { useAuthStore } from "../../store/auth-store";
import { apiFetch } from "../../lib/api";

interface Invoice {
  id: string;
  amount: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
  dueDate: string;
  client?: { name: string } | null;
}

export default function BillingPage() {
  const session = useAuthStore((state) => state.session);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    apiFetch("/billing/invoices", {}, session.accessToken)
      .then((data) => setInvoices(data as Invoice[]))
      .catch((err) => console.error("Failed to load invoices:", err))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <>
      <AuthGate />
      <Shell title="Billing">
        <section className="rounded-md border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Invoices</h2>
            {session?.user?.role === "ADMIN" && (
              <button className="flex h-10 items-center gap-2 rounded-md bg-brand px-3 text-sm font-semibold text-white"><Plus className="h-4 w-4" />New invoice</button>
            )}
          </div>
          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <p className="py-4 text-sm text-muted">Loading invoices...</p>
            ) : invoices.length === 0 ? (
              <p className="py-4 text-sm text-muted">No invoices yet.</p>
            ) : (
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead className="border-b border-line text-muted">
                  <tr>
                    <th className="py-3 font-medium">Client</th>
                    <th className="py-3 font-medium">Amount</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 font-medium">Due</th>
                    <th className="py-3 font-medium">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 font-medium">{invoice.client?.name ?? "Unknown"}</td>
                      <td className="py-3">${invoice.amount}</td>
                      <td className="py-3"><span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold text-brand">{invoice.status}</span></td>
                      <td className="py-3 text-muted">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="py-3"><button aria-label="Download invoice" className="grid h-9 w-9 place-items-center rounded-md border border-line"><Download className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </Shell>
    </>
  );
}

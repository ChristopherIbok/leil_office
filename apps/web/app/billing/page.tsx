"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Plus, Upload, Check } from "lucide-react";
import { Shell } from "../../components/shell";
import { AuthGate } from "../../components/auth-gate";
import { useAuthStore } from "../../store/auth-store";
import { apiFetch } from "../../lib/api";

interface Invoice {
  id: string;
  amount: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
  dueDate: string;
  paymentProofUrl?: string | null;
  client?: { name: string } | null;
}

export default function BillingPage() {
  const session = useAuthStore((state) => state.session);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingInvoiceId = useRef<string | null>(null);

  useEffect(() => {
    if (!session) return;
    apiFetch<Invoice[]>("/billing/invoices", {}, session.accessToken)
      .then(setInvoices)
      .catch((err) => console.error("Failed to load invoices:", err))
      .finally(() => setLoading(false));
  }, [session]);

  async function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const invoiceId = uploadingInvoiceId.current;
    if (!file || !invoiceId || !session) return;

    setUploadingId(invoiceId);
    try {
      const { uploadUrl, fileUrl, key } = await apiFetch<{ uploadUrl: string; fileUrl: string; key: string }>(
        "/files/presign",
        { method: "POST", body: JSON.stringify({ name: file.name, mimeType: file.type }) },
        session.accessToken
      );

      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      const updated = await apiFetch<Invoice>(
        `/billing/invoices/${invoiceId}/payment-proof`,
        { method: "PATCH", body: JSON.stringify({ paymentProofUrl: fileUrl, paymentProofKey: key }) },
        session.accessToken
      );

      setInvoices((prev) => prev.map((inv) => inv.id === invoiceId ? { ...inv, ...updated } : inv));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload proof of payment");
    } finally {
      setUploadingId(null);
      uploadingInvoiceId.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function triggerUpload(invoiceId: string) {
    uploadingInvoiceId.current = invoiceId;
    fileInputRef.current?.click();
  }

  const isClient = session?.user?.role === "CLIENT";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <>
      <AuthGate />
      <Shell title="Billing">
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleProofUpload} />
        <section className="rounded-md border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Invoices</h2>
            {isAdmin && (
              <button className="flex h-10 items-center gap-2 rounded-md bg-brand px-3 text-sm font-semibold text-white">
                <Plus className="h-4 w-4" />New invoice
              </button>
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
                    {!isClient && <th className="py-3 font-medium">Client</th>}
                    <th className="py-3 font-medium">Amount</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 font-medium">Due</th>
                    <th className="py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      {!isClient && <td className="py-3 font-medium">{invoice.client?.name ?? "Unknown"}</td>}
                      <td className="py-3">${invoice.amount}</td>
                      <td className="py-3">
                        <span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold text-brand">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {invoice.paymentProofUrl ? (
                            <a
                              href={invoice.paymentProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs hover:bg-surface"
                            >
                              <Check className="h-3 w-3 text-brand" />
                              Proof
                            </a>
                          ) : isClient && invoice.status !== "PAID" ? (
                            <button
                              onClick={() => triggerUpload(invoice.id)}
                              disabled={uploadingId === invoice.id}
                              className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs hover:bg-surface disabled:opacity-50"
                            >
                              <Upload className="h-3 w-3" />
                              {uploadingId === invoice.id ? "Uploading..." : "Upload Proof"}
                            </button>
                          ) : null}
                          <button aria-label="Download invoice" className="grid h-9 w-9 place-items-center rounded-md border border-line">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
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

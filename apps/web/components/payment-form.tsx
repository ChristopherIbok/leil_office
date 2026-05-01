"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/auth-store";
import { apiFetch } from "../lib/api";

interface Invoice {
  id: string;
  amount: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
  dueDate: string;
  client?: { name: string } | null;
}

interface PaymentFormProps {
  invoice: Invoice;
  onSuccess?: () => void;
}

export function PaymentForm({ invoice, onSuccess }: PaymentFormProps) {
  const session = useAuthStore((state) => state.session);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const { url } = await apiFetch<{ url: string }>("/billing/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: parseFloat(invoice.amount)
        })
      }, session.accessToken);

      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }

  if (invoice.status === "PAID") {
    return (
      <div className="rounded-md bg-green-50 p-4 text-green-700">
        This invoice has been paid
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Invoice #{invoice.id.slice(0, 8)}</p>
          <p className="text-sm text-muted">Amount: ${invoice.amount}</p>
        </div>
        <button
          onClick={handlePay}
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay Now
            </>
          )}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
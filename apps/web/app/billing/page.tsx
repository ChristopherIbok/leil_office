import { Download, Plus } from "lucide-react";
import { Shell } from "../../components/shell";

const invoices = [
  { client: "Northstar Studio", amount: "$8,400", status: "SENT", due: "May 14, 2026" },
  { client: "Helio Labs", amount: "$12,000", status: "DRAFT", due: "May 20, 2026" },
  { client: "Cedar Group", amount: "$4,450", status: "PAID", due: "Apr 28, 2026" }
];

export default function BillingPage() {
  return (
    <Shell title="Billing">
      <section className="rounded-md border border-line bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Invoices</h2>
          <button className="flex h-10 items-center gap-2 rounded-md bg-brand px-3 text-sm font-semibold text-white"><Plus className="h-4 w-4" />New invoice</button>
        </div>
        <div className="mt-4 overflow-x-auto">
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
                <tr key={invoice.client}>
                  <td className="py-3 font-medium">{invoice.client}</td>
                  <td className="py-3">{invoice.amount}</td>
                  <td className="py-3"><span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold text-brand">{invoice.status}</span></td>
                  <td className="py-3 text-muted">{invoice.due}</td>
                  <td className="py-3"><button aria-label="Download invoice" className="grid h-9 w-9 place-items-center rounded-md border border-line"><Download className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}

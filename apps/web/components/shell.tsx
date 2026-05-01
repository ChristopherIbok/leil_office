import Link from "next/link";
import type React from "react";
import { Bell, BriefcaseBusiness, CreditCard, LayoutDashboard, ShieldCheck } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects/demo", label: "Workspace", icon: BriefcaseBusiness },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/admin", label: "Admin", icon: ShieldCheck }
];

export function Shell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-4 py-5 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand text-sm font-bold text-white">LP</div>
          <div>
            <p className="text-sm font-semibold">LEILPORTAL</p>
            <p className="text-xs text-muted">Digital office</p>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-surface">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white px-5">
          <h1 className="text-lg font-semibold">{title}</h1>
          <button aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded-md border border-line bg-white hover:bg-surface">
            <Bell className="h-4 w-4" />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}

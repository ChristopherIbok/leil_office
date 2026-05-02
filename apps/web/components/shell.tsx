import Link from "next/link";
import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";
import { CreditCard, LayoutDashboard, LogOut, ShieldCheck, FolderOpen, User, Menu, X, Clock, Users, Settings } from "lucide-react";
import { NotificationsDropdown } from "./notifications-dropdown";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";

export function Shell({ children, title }: { children: React.ReactNode; title: string }) {
  const { session, logout } = useAuthStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }
  
  const role = session?.user?.role;
  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: FolderOpen },
    ...(role !== "CLIENT" ? [{ href: "/time", label: "Time", icon: Clock }] : []),
    { href: "/billing", label: "Billing", icon: CreditCard },
    ...(role !== "CLIENT" ? [{ href: "/team", label: "Team", icon: Users }] : []),
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/profile", label: "Profile", icon: User },
    ...(role === "ADMIN" ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : [])
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-white px-4 py-5 
        transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:hidden"}
      `}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-brand text-sm font-bold text-white">LP</div>
            <div>
              <p className="text-sm font-semibold">LEILPORTAL</p>
              <p className="text-xs text-muted">Digital office</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-2">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-surface"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 rounded-md bg-surface p-3">
            <p className="text-xs font-medium">{session?.user?.name}</p>
            <p className="text-xs text-muted">{session?.user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
      
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-line bg-white px-4 py-5">
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
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 rounded-md bg-surface p-3">
            <p className="text-xs font-medium">{session?.user?.name}</p>
            <p className="text-xs text-muted">{session?.user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
      
      <main className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:px-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base lg:text-lg font-semibold truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-1 lg:gap-2">
            <ThemeToggle />
            <NotificationsDropdown />
          </div>
        </header>
        <div className="p-4 lg:p-5">{children}</div>
      </main>
    </div>
  );
}
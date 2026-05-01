import { ShieldCheck, UsersRound } from "lucide-react";
import { Shell } from "../../components/shell";

const roles = [
  { label: "Admins", count: 3 },
  { label: "Team Members", count: 28 },
  { label: "Clients", count: 16 }
];

export default function AdminPage() {
  return (
    <Shell title="Admin Panel">
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => (
          <section key={role.label} className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{role.label}</p>
              <UsersRound className="h-4 w-4 text-brand" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{role.count}</p>
          </section>
        ))}
      </div>
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
  );
}

"use client";

import { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Moon, Key } from "lucide-react";
import { Shell } from "../../components/shell";
import { useAuthStore } from "../../store/auth-store";

export default function SettingsPage() {
  const session = useAuthStore((state) => state.session);
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");

  return (
    <Shell title="Settings">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted">Manage your account preferences</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="rounded-md border border-line bg-white">
          <div className="border-b border-line px-4 py-3 flex items-center gap-2">
            <User className="h-4 w-4 text-muted" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm bg-gray-50"
              />
              <p className="text-xs text-muted mt-1">Contact admin to change email</p>
            </div>
            <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">
              Save Changes
            </button>
          </div>
        </div>

        <div className="rounded-md border border-line bg-white">
          <div className="border-b border-line px-4 py-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted" />
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <div className="p-4 space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Email notifications for new tasks</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Email notifications for mentions</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Email notifications for project updates</span>
            </label>
          </div>
        </div>

        <div className="rounded-md border border-line bg-white">
          <div className="border-b border-line px-4 py-3 flex items-center gap-2">
            <Key className="h-4 w-4 text-muted" />
            <h2 className="font-semibold">Security</h2>
          </div>
          <div className="p-4">
            <button className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-surface">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
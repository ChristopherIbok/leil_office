'use client';
import React, { useEffect } from 'react';
import { useAuthStore } from '../useAuthStore';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">LEILPORTAL</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user.name} ({user.role})
          </span>
          <button
            onClick={logout}
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="p-8">
        <h2 className="text-2xl font-semibold text-gray-800">Welcome back, {user.name}!</h2>
      </main>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "../../../components/auth-gate";
import { useAuthStore } from "../../../store/auth-store";
import { apiFetch } from "../../../lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PLANNING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const project = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({ name, description, status })
      }, session.accessToken);

      router.push(`/projects/${(project as { id: string }).id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setLoading(false);
    }
  }

  return (
    <>
      <AuthGate />
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold">Create New Project</h1>
        <p className="mt-2 text-muted">Fill in the details to create a new project</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-md border border-line bg-white p-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Project Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-line px-3 py-2"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-line px-3 py-2"
              placeholder="Describe the project"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border border-line px-3 py-2"
            >
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
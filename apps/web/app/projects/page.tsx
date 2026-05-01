"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { Shell } from "../../components/shell";
import { AuthGate } from "../../components/auth-gate";
import { useAuthStore } from "../../store/auth-store";
import { fetchProjects } from "../../lib/api";

export default function ProjectsPage() {
  const session = useAuthStore((state) => state.session);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; status: string; description?: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    fetchProjects(session.accessToken)
      .then((data) => setProjects(data))
      .catch((err) => console.error("Failed to load projects:", err))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <>
      <AuthGate />
      <Shell title="Projects">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">All Projects</h2>
          <Link
            href="/projects/new"
            className="flex h-10 items-center gap-2 rounded-md bg-brand px-3 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-sm text-muted">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted">No projects found. Create your first project!</p>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-md border border-line bg-white p-5 transition-colors hover:border-brand"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-5 w-5 text-brand" />
                    <h3 className="font-semibold group-hover:text-brand">{project.name}</h3>
                  </div>
                  <span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold text-brand">
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="mt-2 text-sm text-muted line-clamp-2">{project.description}</p>
                )}
              </Link>
            ))
          )}
        </div>
      </Shell>
    </>
  );
}
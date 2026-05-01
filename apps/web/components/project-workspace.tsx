"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth-store";
import { fetchProject, ProjectDetail } from "../lib/api";
import { AuthGate } from "./auth-gate";
import { Shell } from "./shell";
import { WorkspaceTabs } from "./workspace-tabs";

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const session = useAuthStore((state) => state.session);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    setLoading(true);
    setError(null);
    fetchProject(projectId, session.accessToken)
      .then((data) => setProject(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load project."))
      .finally(() => setLoading(false));
  }, [projectId, session]);

  return (
    <>
      <AuthGate />
      <Shell title={project?.name ?? "Project Workspace"}>
        {loading ? (
          <div className="rounded-md border border-line bg-white p-6 text-center text-sm text-muted">Loading project details...</div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : project ? (
          <>
            <section className="mb-5 rounded-md border border-line bg-white p-5">
              <p className="text-sm font-semibold text-brand">ACTIVE PROJECT</p>
              <h2 className="mt-2 text-2xl font-semibold">{project.name}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{project.description ?? "Collaborate with clients, track tasks, and keep delivery aligned."}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
                <span className="rounded-full border border-line px-3 py-2">Status: {project.status}</span>
                {project.client ? <span className="rounded-full border border-line px-3 py-2">Client: {project.client.name}</span> : null}
                <span className="rounded-full border border-line px-3 py-2">Tasks: {project.tasks.length}</span>
                <span className="rounded-full border border-line px-3 py-2">Files: {project.files.length}</span>
              </div>
            </section>
            <WorkspaceTabs project={project} />
          </>
        ) : (
          <div className="rounded-md border border-line bg-white p-6 text-sm text-muted">No project found.</div>
        )}
      </Shell>
    </>
  );
}

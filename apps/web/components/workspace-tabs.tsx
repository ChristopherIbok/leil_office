"use client";

import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { KanbanBoard } from "./kanban-board";
import { ChatPanel } from "./chat-panel";
import { FilesPanel } from "./files-panel";
import { TimePanel } from "./time-panel";
import { useAuthStore } from "../store/auth-store";
import { apiFetch } from "../lib/api";
import type { ProjectDetail } from "../lib/api";

const tabs = ["Overview", "Tasks", "Files", "Chat", "Time"] as const;

export function WorkspaceTabs({ project }: { project: ProjectDetail }) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Overview");
  const [currentProject, setCurrentProject] = useState(project);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2 border-b border-line pb-3">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActive(tab)} className={`rounded-md px-3 py-2 text-sm font-medium ${active === tab ? "bg-brand text-white" : "bg-white text-ink ring-1 ring-line"}`}>
            {tab}
          </button>
        ))}
      </div>
      {active === "Overview" && <OverviewPanel project={currentProject} onUpdate={setCurrentProject} />}
      {active === "Tasks" && <KanbanBoard initialTasks={currentProject.tasks} projectId={currentProject.id} />}
      {active === "Files" && <FilesPanel projectId={currentProject.id} files={currentProject.files as any} />}
      {active === "Chat" && <ChatPanel projectId={currentProject.id} channels={currentProject.channels} />}
      {active === "Time" && <TimePanel projectId={currentProject.id} tasks={currentProject.tasks} />}
    </div>
  );
}

function OverviewPanel({ project, onUpdate }: { project: ProjectDetail; onUpdate: (p: ProjectDetail) => void }) {
  const session = useAuthStore((state) => state.session);
  const canEdit = session?.user?.role === "ADMIN" || session?.user?.role === "TEAM_MEMBER";
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [status, setStatus] = useState(project.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<ProjectDetail>(`/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, description, status })
      }, session.accessToken);
      onUpdate({ ...project, ...updated });
      setEditing(false);
    } catch {
      setError("Failed to save changes.");
    }
    setSaving(false);
  }

  function handleCancel() {
    setName(project.name);
    setDescription(project.description ?? "");
    setStatus(project.status);
    setError(null);
    setEditing(false);
  }

  if (editing) {
    return (
      <section className="rounded-md border border-line bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Edit Project</h3>
          <button onClick={handleCancel} className="rounded-md p-1.5 text-muted hover:bg-surface">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>
          <label className="text-sm font-medium">Project Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Scope / Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"
            placeholder="Describe the project scope..."
          />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectDetail["status"])}
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"
          >
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </section>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-md border border-line bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Scope</h3>
          {canEdit && (
            <button onClick={() => setEditing(true)} className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-brand">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">{project.description ?? "No description yet."}</p>
      </div>
      <div className="rounded-md border border-line bg-white p-4">
        <h3 className="font-semibold">Client</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{project.client ? project.client.name : "No client assigned."}</p>
      </div>
      <div className="rounded-md border border-line bg-white p-4">
        <h3 className="font-semibold">Status</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{project.status}</p>
      </div>
    </section>
  );
}

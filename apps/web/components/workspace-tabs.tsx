"use client";

import { useState } from "react";
import { KanbanBoard } from "./kanban-board";
import { ChatPanel } from "./chat-panel";
import { FilesPanel } from "./files-panel";
import { TimePanel } from "./time-panel";
import type { ProjectDetail } from "../lib/api";

const tabs = ["Overview", "Tasks", "Files", "Chat", "Time"] as const;

export function WorkspaceTabs({ project }: { project: ProjectDetail }) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Overview");

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2 border-b border-line pb-3">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActive(tab)} className={`rounded-md px-3 py-2 text-sm font-medium ${active === tab ? "bg-brand text-white" : "bg-white text-ink ring-1 ring-line"}`}>
            {tab}
          </button>
        ))}
      </div>
      {active === "Overview" && <OverviewPanel project={project} />}
      {active === "Tasks" && <KanbanBoard initialTasks={project.tasks} />}
      {active === "Files" && <FilesPanel projectId={project.id} files={project.files as any} />}
      {active === "Chat" && <ChatPanel projectId={project.id} channels={project.channels} />}
      {active === "Time" && <TimePanel projectId={project.id} tasks={project.tasks} />}
    </div>
  );
}

function OverviewPanel({ project }: { project: ProjectDetail }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-md border border-line bg-white p-4">
        <h3 className="font-semibold">Scope</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{project.description ?? "Track ownership, status, and delivery context for the active engagement."}</p>
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

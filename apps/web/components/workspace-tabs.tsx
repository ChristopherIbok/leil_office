"use client";

import { useState } from "react";
import { FileUp, MessageSquareText, Timer } from "lucide-react";
import { KanbanBoard } from "./kanban-board";
import type { ProjectDetail, TaskRecord } from "../lib/api";

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
      {active === "Files" && <FilesPanel files={project.files} />}
      {active === "Chat" && <ChatPanel channels={project.channels} />}
      {active === "Time" && <TimePanel tasks={project.tasks} />}
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

function FilesPanel({ files }: { files: ProjectDetail["files"] }) {
  return (
    <section className="rounded-md border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Documents</h3>
        <button className="flex h-10 items-center gap-2 rounded-md bg-brand px-3 text-sm font-semibold text-white"><FileUp className="h-4 w-4" />Upload</button>
      </div>
      <div className="mt-4 divide-y divide-line text-sm">
        {files.length === 0 ? (
          <p className="py-4 text-sm text-muted">No files uploaded yet.</p>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between py-3">
              <span>{file.name}</span>
              <span className="text-muted">v{file.version}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ChatPanel({ channels }: { channels: ProjectDetail["channels"] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      <aside className="rounded-md border border-line bg-white p-4">
        <h3 className="font-semibold">Channels</h3>
        <div className="mt-3 space-y-2 text-sm text-muted">
          {channels.length === 0 ? <p>No chat channels yet.</p> : channels.map((channel) => <p key={channel.id}># {channel.name}</p>)}
        </div>
      </aside>
      <div className="rounded-md border border-line bg-white p-4">
        <div className="space-y-3 text-sm">
          <p><strong>System:</strong> Channels are ready for project conversations.</p>
          <p><strong>Team:</strong> Use messages to coordinate delivery and client feedback.</p>
        </div>
        <div className="mt-5 flex gap-2">
          <input className="h-10 flex-1 rounded-md border border-line px-3" placeholder="Message #general" />
          <button aria-label="Send message" className="grid h-10 w-10 place-items-center rounded-md bg-brand text-white"><MessageSquareText className="h-4 w-4" /></button>
        </div>
      </div>
    </section>
  );
}

function TimePanel({ tasks }: { tasks: TaskRecord[] }) {
  const totalHours = tasks.length * 4;
  return (
    <section className="rounded-md border border-line bg-white p-5">
      <div className="flex items-center gap-3">
        <Timer className="h-5 w-5 text-brand" />
        <h3 className="font-semibold">Time Tracking</h3>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-line p-4">
          <p className="text-sm text-muted">Active tasks</p>
          <p className="mt-2 text-xl font-semibold">{tasks.length}</p>
        </div>
        <div className="rounded-md border border-line p-4">
          <p className="text-sm text-muted">Estimated hours</p>
          <p className="mt-2 text-xl font-semibold">{totalHours}h</p>
        </div>
        <div className="rounded-md border border-line p-4">
          <p className="text-sm text-muted">Billable</p>
          <p className="mt-2 text-xl font-semibold">{Math.max(8, Math.round(totalHours * 0.65))}h</p>
        </div>
      </div>
    </section>
  );
}

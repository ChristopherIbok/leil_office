"use client";

import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { useState } from "react";

const columns = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "REVIEW", label: "Review" },
  { id: "DONE", label: "Done" }
];

const seedTasks = [
  { id: "1", title: "Finalize kickoff agenda", status: "TODO", owner: "Nia", tag: "Client" },
  { id: "2", title: "Implement auth guard tests", status: "IN_PROGRESS", owner: "Sam", tag: "Backend" },
  { id: "3", title: "Review document permissions", status: "REVIEW", owner: "Leah", tag: "Security" },
  { id: "4", title: "Publish workspace brief", status: "DONE", owner: "Mika", tag: "Ops" }
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState(seedTasks);

  function onDragEnd(event: DragEndEvent) {
    const overId = String(event.over?.id ?? "");
    if (!overId) return;
    setTasks((current) => current.map((task) => (task.id === event.active.id ? { ...task, status: overId } : task)));
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} id={column.id} label={column.label} tasks={tasks.filter((task) => task.status === column.id)} />
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({ id, label, tasks }: { id: string; label: string; tasks: typeof seedTasks }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`min-h-[26rem] rounded-md border p-3 ${isOver ? "border-brand bg-emerald-50" : "border-line bg-surface"}`}>
      <h3 className="mb-3 text-sm font-semibold">{label}</h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: (typeof seedTasks)[number] }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes} className="w-full cursor-grab rounded-md border border-line bg-white p-3 text-left shadow-sm active:cursor-grabbing">
      <p className="text-sm font-medium">{task.title}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{task.owner}</span>
        <span className="rounded-md bg-white px-2 py-1 text-accent ring-1 ring-line">{task.tag}</span>
      </div>
    </button>
  );
}

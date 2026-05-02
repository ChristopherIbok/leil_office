"use client";

import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import { useAuthStore } from "../store/auth-store";
import { apiFetch } from "../lib/api";
import { TaskModal } from "./task-modal";

const columns = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "REVIEW", label: "Review" },
  { id: "DONE", label: "Done" }
];

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  assigneeId?: string | null;
  assignee?: { id: string; name: string; email: string } | null;
  dueDate?: string | null;
  tags: string[];
}

interface KanbanBoardProps {
  initialTasks: Task[];
  projectId: string;
}

export function KanbanBoard({ initialTasks, projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const session = useAuthStore((state) => state.session);

  async function onDragEnd(event: DragEndEvent) {
    const overId = String(event.over?.id ?? "");
    if (!overId) return;

    const taskId = event.active.id as string;
    
    setTasks((current) => 
      current.map((task) => 
        task.id === taskId ? { ...task, status: overId as Task["status"] } : task
      )
    );

    if (session) {
      try {
        await apiFetch(`/tasks/${taskId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: overId })
        }, session.accessToken);
      } catch (err) {
        console.error("Failed to update task:", err);
        setTasks((current) => 
          current.map((task) => 
            task.id === taskId ? { ...task, status: initialTasks.find(t => t.id === taskId)?.status ?? task.status } : task
          )
        );
      }
    }
  }

  function handleTaskUpdate(updatedTask: Task) {
    setTasks((current) => 
      current.map((task) => task.id === updatedTask.id ? updatedTask : task)
    );
  }

  return (
    <>
      <DndContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <KanbanColumn 
              key={column.id} 
              id={column.id} 
              label={column.label} 
              tasks={tasks.filter((task) => task.status === column.id)}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
      </DndContext>
      
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}
    </>
  );
}

function KanbanColumn({ id, label, tasks, onTaskClick }: { id: string; label: string; tasks: Task[]; onTaskClick: (task: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`min-h-[26rem] rounded-md border p-3 ${isOver ? "border-brand bg-brand/5" : "border-line bg-surface"}`}>
      <h3 className="mb-3 text-sm font-semibold">{label}</h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <button 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="w-full cursor-grab rounded-md border border-line bg-white p-3 text-left shadow-sm active:cursor-grabbing hover:border-brand"
    >
      <p className="text-sm font-medium">{task.title}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{task.assignee?.name ?? "Unassigned"}</span>
        {task.tags[0] && <span className="rounded-md bg-white px-2 py-1 text-accent ring-1 ring-line">{task.tags[0]}</span>}
      </div>
    </button>
  );
}

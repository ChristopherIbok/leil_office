"use client";

import { useState } from "react";
import { X, Calendar, User, Tag, MessageSquare, Clock } from "lucide-react";
import { useAuthStore } from "../store/auth-store";
import { apiFetch } from "../lib/api";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  assignee?: { id: string; name: string; email: string } | null;
  dueDate?: string | null;
  tags: string[];
}

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

export function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  const session = useAuthStore((state) => state.session);
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!session) return;

    setSaving(true);
    try {
      const updated = await apiFetch(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editedTask.title,
          description: editedTask.description,
          status: editedTask.status,
          dueDate: editedTask.dueDate,
          tags: editedTask.tags
        })
      }, session.accessToken);
      
      onUpdate(updated as Task);
      onClose();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
    setSaving(false);
  }

  const statusColors = {
    TODO: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    REVIEW: "bg-yellow-100 text-yellow-700",
    DONE: "bg-green-100 text-green-700"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="text-lg font-semibold">Task Details</h2>
          <button onClick={onClose} className="rounded-md p-2 hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={editedTask.description || ""}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="Add a description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Status
              </label>
              <select
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task["status"] })}
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Due Date
              </label>
              <input
                type="date"
                value={editedTask.dueDate?.split("T")[0] || ""}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value || null })}
                className="mt-1 w-full rounded-md border border-line px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4" />
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={editedTask.tags.join(", ")}
              onChange={(e) => setEditedTask({ ...editedTask, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          {task.assignee && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <User className="h-4 w-4" />
              Assigned to: {task.assignee.name}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={onClose}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
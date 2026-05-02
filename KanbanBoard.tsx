'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/useAuthStore';
import { MoreHorizontal, Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { io } from 'socket.io-client';

export default function KanbanBoard({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const token = useAuthStore((state) => state.token);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch(`${apiUrl}/tasks?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    };
    if (token) fetchTasks();
  }, [projectId, token]);

  // Real-time sync
  useEffect(() => {
    const socket = io('http://localhost:4000/tasks', { auth: { token } });
    socket.emit('joinProject', projectId);

    socket.on('taskUpdated', (data: any) => {
      if (data.action === 'created') {
        setTasks((prev) => [...prev, data.task]);
      } else if (data.action === 'updated') {
        setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
      } else if (data.action === 'deleted') {
        setTasks((prev) => prev.filter((t) => t.id !== data.taskId));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, token]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Allows clicking buttons without triggering drag
    })
  );

  const columns = [
    { key: 'TODO', label: 'To Do' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'REVIEW', label: 'Review' },
    { key: 'DONE', label: 'Completed' },
  ];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`http://localhost:4000/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update task status', err);
      // Revert on error if necessary
    }
  };

  return user?.role !== 'CLIENT' ? ( // Disable DndContext entirely for CLIENT
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 p-8 h-full overflow-x-auto items-start bg-gray-50">
        {columns.map((col) => (
          <div key={col.key} className="flex-shrink-0 w-80 flex flex-col max-h-full">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                {col.label}{' '}
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {tasks.filter((t) => t.status === col.key).length}
                </span>
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <Plus size={18} />
              </button>
            </div>

            <SortableContext
              id={col.key}
              items={tasks.filter((t) => t.status === col.key).map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                id={col.key}
                className="flex-1 space-y-4 overflow-y-auto pb-4 custom-scrollbar min-h-[150px]"
              >
                {tasks
                  .filter((t) => t.status === col.key)
                  .map((task) => (
                    <SortableTask key={task.id} task={task} />
                  ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  ) : (
    <div className="flex gap-6 p-8 h-full overflow-x-auto items-start bg-gray-50">
      {columns.map((col) => (
        <div key={col.key} className="flex-shrink-0 w-80 flex flex-col max-h-full">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              {col.label}{' '}
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {tasks.filter((t) => t.status === col.key).length}
                </span>
            </h3>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pb-4 custom-scrollbar">
            {tasks
              .filter((t) => t.status === col.key)
              .map((task) => (
                <StaticTask key={task.id} task={task} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SortableTask({ task }: { task: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-1 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500"
          >
            <GripVertical size={14} />
          </button>
          <h4 className="text-sm font-semibold text-gray-800 leading-snug">
            {task.title}
          </h4>
        </div>
        <button type="button" className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
          <MoreHorizontal size={16} />
        </button>
      </div>
      {task.assignee && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
            {task.assignee.name.charAt(0)}
          </div>
          <span className="text-xs text-gray-500">{task.assignee.name}</span>
        </div>
      )}
    </div>
  );
}

// New component for non-draggable tasks (for CLIENT role)
function StaticTask({ task }: { task: any }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-2">
          <h4 className="text-sm font-semibold text-gray-800 leading-snug">
            {task.title}
          </h4>
        </div>
        {/* No drag handle or MoreHorizontal button for static tasks */}
      </div>
      {task.assignee && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
            {task.assignee.name.charAt(0)}
          </div>
          <span className="text-xs text-gray-500">{task.assignee.name}</span>
        </div>
      )}
    </div>
  );
}
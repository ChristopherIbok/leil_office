'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import KanbanBoard from '@/components/KanbanBoard';
import ChatRoom from '@/components/ChatRoom';
import { useAuthStore } from '@/useAuthStore';
import { LayoutGrid, MessageSquare } from 'lucide-react';

export default function ProjectWorkspace() {
  const { id: projectId } = useParams();
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat'>('tasks');
  const [project, setProject] = useState<any>(null);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        }
      } catch (err) {
        console.error('Failed to load project', err);
      }
    };
    if (projectId && token) fetchProject();
  }, [projectId, token]);

  if (!project) return (
    <div className="flex h-screen items-center justify-center text-gray-500">
      Loading workspace...
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Workspace Header */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">PROJECT</span>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          </div>
          <p className="text-xs text-gray-500 line-clamp-1">{project.description || 'No description provided.'}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('tasks')} // Default to tasks if client role
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'tasks' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid size={16} /> Tasks
          </button>
          {user?.role !== 'CLIENT' && ( // Only show Tasks tab for Admin/Team Member
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'tasks' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid size={16} /> Tasks
            </button>
          )}
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'chat' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare size={16} /> Chat
          </button>
        </div>
      </header>

      {/* Workspace Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'tasks' && user?.role !== 'CLIENT' ? ( // Only render Kanban for Admin/Team Member
          <KanbanBoard projectId={projectId as string} />
        ) : (
          <ChatRoom projectId={projectId as string} />
        )}
      </main>
    </div>
  );
}
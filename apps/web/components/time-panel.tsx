"use client";

import { useState, useEffect } from "react";
import { Timer, Play, Square } from "lucide-react";
import { useAuthStore } from "../store/auth-store";
import { apiFetch } from "../lib/api";

interface Task {
  id: string;
  title: string;
  status: string;
}

interface TimeLog {
  id: string;
  taskId: string;
  duration: number;
  date: string;
}

interface TimePanelProps {
  projectId: string;
  tasks: Task[];
}

export function TimePanel({ projectId, tasks }: TimePanelProps) {
  const session = useAuthStore((state) => state.session);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [activeTimer, setActiveTimer] = useState<{ taskId: string; startTime: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Load time logs
  useEffect(() => {
    if (!session) return;

    apiFetch(`/time-logs?projectId=${projectId}`, {}, session.accessToken)
      .then((data) => setTimeLogs(data as TimeLog[]))
      .catch((err) => console.error("Failed to load time logs:", err));
  }, [projectId, session]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - activeTimer.startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  function startTimer(taskId: string) {
    if (activeTimer) return;
    setActiveTimer({ taskId, startTime: Date.now() });
    setElapsed(0);
  }

  async function stopTimer() {
    if (!activeTimer || !session) return;

    const duration = Math.round((Date.now() - activeTimer.startTime) / 1000);
    
    try {
      const timeLog = await apiFetch<TimeLog>("/time-logs", {
        method: "POST",
        body: JSON.stringify({
          taskId: activeTimer.taskId,
          duration
        })
      }, session.accessToken);

      setTimeLogs((prev) => [...prev, timeLog]);
    } catch (err) {
      console.error("Failed to save time log:", err);
    }

    setActiveTimer(null);
    setElapsed(0);
  }

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const totalSeconds = timeLogs.reduce((sum, log) => sum + log.duration, 0) + (activeTimer ? elapsed : 0);
  const billableSeconds = Math.round(totalSeconds * 0.65);

  return (
    <section className="rounded-md border border-line bg-white p-5">
      <div className="flex items-center gap-3">
        <Timer className="h-5 w-5 text-brand" />
        <h3 className="font-semibold">Time Tracking</h3>
        {activeTimer && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            {formatTime(elapsed)}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-line p-4">
          <p className="text-sm text-muted">Active tasks</p>
          <p className="mt-2 text-xl font-semibold">{tasks.length}</p>
        </div>
        <div className="rounded-md border border-line p-4">
          <p className="text-sm text-muted">Total time</p>
          <p className="mt-2 text-xl font-semibold">{formatTime(totalSeconds)}</p>
        </div>
        <div className="rounded-md border border-line p-4">
          <p className="text-sm text-muted">Billable</p>
          <p className="mt-2 text-xl font-semibold">{formatTime(billableSeconds)}</p>
        </div>
      </div>

      {/* Task timer */}
      <div className="mt-6">
        <h4 className="font-semibold">Start Timer</h4>
        <div className="mt-3 space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between rounded-md border border-line p-3">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-muted">{task.status}</p>
              </div>
              {activeTimer?.taskId === task.id ? (
                <button
                  onClick={stopTimer}
                  className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={() => startTimer(task.id)}
                  disabled={!!activeTimer}
                  className="flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  Start
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent logs */}
      {timeLogs.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold">Recent Logs</h4>
          <div className="mt-3 divide-y divide-line">
            {timeLogs.slice(-5).reverse().map((log) => {
              const task = tasks.find((t) => t.id === log.taskId);
              return (
                <div key={log.id} className="flex items-center justify-between py-2">
                  <span className="text-sm">{task?.title ?? "Unknown task"}</span>
                  <span className="text-sm text-muted">{formatTime(log.duration)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
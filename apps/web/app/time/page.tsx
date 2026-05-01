"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Clock } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { Shell } from "../../components/shell";
import { useAuthStore } from "../../store/auth-store";
import { apiFetch } from "../../lib/api";

interface TimeEntry {
  id: string;
  description: string;
  startTime: string;
  endTime?: string;
  projectId?: string;
  projectName?: string;
}

export default function TimePage() {
  const session = useAuthStore((state) => state.session);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!session) return;
    fetchEntries();
  }, [session]);

  const fetchEntries = async () => {
    try {
      const data = await apiFetch("/time-logs/me", {}, session!.accessToken);
      setEntries(data as TimeEntry[]);
      const active = (data as TimeEntry[]).find(e => !e.endTime);
      if (active) {
        setActiveEntry(active);
        setDescription(active.description);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async () => {
    if (!session) return;
    try {
      const res = await apiFetch("/time-logs", {
        method: "POST",
        body: JSON.stringify({ description, startTime: new Date().toISOString() }),
      }, session.accessToken);
      setActiveEntry(res as TimeEntry);
    } catch (e) {
      console.error(e);
    }
  };

  const stopTimer = async () => {
    if (!session || !activeEntry) return;
    try {
      await apiFetch(`/time-logs/${activeEntry.id}`, {
        method: "PATCH",
        body: JSON.stringify({ endTime: new Date().toISOString() }),
      }, session.accessToken);
      setActiveEntry(null);
      setDescription("");
      fetchEntries();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalHours = entries.reduce((sum, e) => {
    const start = new Date(e.startTime).getTime();
    const end = e.endTime ? new Date(e.endTime).getTime() : Date.now();
    return sum + (end - start);
  }, 0) / (1000 * 60 * 60);

  return (
    <Shell title="Time Tracking">
      <div className="p-0">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Time Tracking</h1>
          <p className="text-sm text-muted">Track your work hours</p>
        </div>

        <div className="rounded-md border border-line bg-white p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="flex-1 rounded-md border border-line px-3 py-2 text-sm"
              disabled={!!activeEntry}
            />
            {activeEntry ? (
              <button
                onClick={stopTimer}
                className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white"
              >
                <Pause className="h-4 w-4" />
                Stop
              </button>
            ) : (
              <button
                onClick={startTimer}
                disabled={!description}
                className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                Start
              </button>
            )}
          </div>
          {activeEntry && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted">
              <Clock className="h-4 w-4 animate-pulse" />
              <span>Timer running: {formatDuration(activeEntry.startTime)}</span>
            </div>
          )}
        </div>

        <div className="rounded-md border border-line bg-white p-4 mb-4">
          <div className="text-2xl font-semibold">{totalHours.toFixed(1)}h</div>
          <p className="text-sm text-muted">Total hours this period</p>
        </div>

        <div className="rounded-md border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-semibold">Recent Entries</h2>
          </div>
          {loading ? (
            <p className="p-4 text-sm text-muted">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="p-4 text-sm text-muted">No time entries yet</p>
          ) : (
            <div className="divide-y divide-line">
              {entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{entry.description || "No description"}</p>
                    <p className="text-xs text-muted">
                      {new Date(entry.startTime).toLocaleDateString()}
                      {entry.projectName && ` • ${entry.projectName}`}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatDuration(entry.startTime, entry.endTime)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
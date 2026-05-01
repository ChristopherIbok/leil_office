"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useAuthStore } from "../store/auth-store";
import { apiFetch } from "../lib/api";
import Link from "next/link";

interface SearchResult {
  type: "project" | "task" | "file";
  id: string;
  title: string;
  subtitle?: string;
}

export function GlobalSearch() {
  const session = useAuthStore((state) => state.session);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const projects = await apiFetch(`/projects?search=${query}`, {}, session.accessToken);
        setResults((projects as any[]).map(p => ({
          type: "project" as const,
          id: p.id,
          title: p.name,
          subtitle: p.status
        })));
      } catch (err) {
        console.error("Search failed:", err);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, session]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search projects, tasks..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="h-9 w-64 rounded-md border border-line bg-surface pl-9 pr-8 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-line bg-white shadow-lg">
          {loading ? (
            <div className="p-4 text-sm text-muted">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted">No results found</div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.type === "project" ? `/projects/${result.id}` : "#"}
                  onClick={() => setIsOpen(false)}
                  className="block border-b border-line p-3 hover:bg-surface"
                >
                  <p className="font-medium text-sm">{result.title}</p>
                  <p className="text-xs text-muted capitalize">{result.type} {result.subtitle && `• ${result.subtitle}`}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {(isOpen || query) && (
        <div 
          className="fixed inset-0" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
}
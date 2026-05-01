"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    { key: "d", action: () => router.push("/dashboard"), description: "Go to Dashboard" },
    { key: "p", action: () => router.push("/projects"), description: "Go to Projects" },
    { key: "b", action: () => router.push("/billing"), description: "Go to Billing" },
    { key: "n", ctrl: true, action: () => router.push("/projects/new"), description: "New Project" },
    { key: "/", action: () => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      searchInput?.focus();
    }, description: "Focus Search" },
  ];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === e.key.toLowerCase() && 
        (s.ctrl ? (e.metaKey || e.ctrlKey) : true)
      );
      
      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  return shortcuts;
}

export function KeyboardShortcutsHelp() {
  const shortcuts = useKeyboardShortcuts();
  
  return (
    <div className="rounded-md border border-line bg-white p-4 text-sm">
      <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
      <ul className="space-y-1 text-muted">
        {shortcuts.map((s, i) => (
          <li key={i}>
            <kbd className="rounded bg-surface px-1.5 py-0.5 text-xs font-mono">
              {s.ctrl ? "⌘" : ""}{s.key.toUpperCase()}
            </kbd> 
            {" "}{s.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
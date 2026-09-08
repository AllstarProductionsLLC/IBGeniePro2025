"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createWorkspace } from "@/lib/starter-resources";
import { workspaceSchema, type WorkspaceState } from "@/lib/workspace";
const KEY = "ibgenie.workspace.v1";
export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(createWorkspace);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const lastSaved = useRef("");
  const writable = useRef(true);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setState(workspaceSchema.parse(JSON.parse(raw)));
        lastSaved.current = raw;
      }
    } catch {
      writable.current = false;
      setStorageError(
        "Your saved workspace could not be opened. The original copy has been kept. Export it from Settings before restoring a backup.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !writable.current) return;
    const raw = JSON.stringify(state);
    if (raw === lastSaved.current) return;
    try {
      localStorage.setItem(KEY, raw);
      lastSaved.current = raw;
      setStorageError("");
    } catch {
      setStorageError(
        "This browser could not save your changes. Export a backup from Settings before closing this tab.",
      );
    }
  }, [state, ready]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue !== lastSaved.current) {
        writable.current = false;
        setStorageError(
          "This workspace changed in another tab. Export this tab’s work before reloading.",
        );
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const update = useCallback(
    (fn: (s: WorkspaceState) => WorkspaceState) => setState(fn),
    [],
  );
  const restore = useCallback((value: unknown) => {
    const parsed = workspaceSchema.parse(value);
    const raw = JSON.stringify(parsed);
    localStorage.setItem(KEY, raw);
    lastSaved.current = raw;
    writable.current = true;
    setStorageError("");
    setState(parsed);
  }, []);
  return {
    state,
    update,
    ready,
    storageError,
    restore,
    rawBackup: () => localStorage.getItem(KEY) || JSON.stringify(state),
  };
}

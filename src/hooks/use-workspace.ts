"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMembership } from "./use-membership";
import { createWorkspace } from "@/lib/starter-resources";
import { workspaceSchema, type WorkspaceState } from "@/lib/workspace";
const KEY = "ibgenie.workspace.v1";
export function useWorkspace() {
  const { status } = useMembership();
  const key = status?.memberKey ? KEY + ":" + status.memberKey : KEY;
  const [entry, setEntry] = useState<{ key: string; state: WorkspaceState }>(
    () => ({ key: "", state: createWorkspace() }),
  );
  const [storageError, setStorageError] = useState("");
  const lastSaved = useRef(""),
    writable = useRef(true);
  useEffect(() => {
    if (!status) return;
    writable.current = true;
    lastSaved.current = "";
    setStorageError("");
    let state = createWorkspace();
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        state = workspaceSchema.parse(JSON.parse(raw));
        lastSaved.current = raw;
      }
    } catch {
      writable.current = false;
      setStorageError(
        "Your saved workspace could not be opened. The original copy has been kept. Export it from Settings before restoring a backup.",
      );
    }
    setEntry({ key, state });
  }, [key, !!status]);
  useEffect(() => {
    if (entry.key !== key || !writable.current) return;
    const raw = JSON.stringify(entry.state);
    if (raw === lastSaved.current) return;
    try {
      localStorage.setItem(key, raw);
      lastSaved.current = raw;
      setStorageError("");
    } catch {
      setStorageError(
        "This browser could not save your changes. Export a backup from Settings before closing this tab.",
      );
    }
  }, [entry, key]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== lastSaved.current) {
        writable.current = false;
        setStorageError(
          "This workspace changed in another tab. Export this tab’s work before reloading.",
        );
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);
  const update = useCallback(
    (fn: (s: WorkspaceState) => WorkspaceState) =>
      setEntry((v) => ({ ...v, state: fn(v.state) })),
    [],
  );
  const restore = useCallback(
    (value: unknown) => {
      const parsed = workspaceSchema.parse(value),
        raw = JSON.stringify(parsed);
      localStorage.setItem(key, raw);
      lastSaved.current = raw;
      writable.current = true;
      setStorageError("");
      setEntry({ key, state: parsed });
    },
    [key],
  );
  return {
    state: entry.state,
    update,
    ready: !!status && entry.key === key,
    storageError,
    restore,
    rawBackup: () => localStorage.getItem(key) || JSON.stringify(entry.state),
  };
}

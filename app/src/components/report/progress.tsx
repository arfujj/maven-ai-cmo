"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Progress } from "@/lib/types";

type Kind = "fixes" | "drafts" | "decisions";
interface Ctx {
  progress: Progress;
  has: (kind: Kind, key: string) => boolean;
  toggle: (kind: Kind, key: string) => void;
  setEdit: (key: string, value: string | null) => void;
  readOnly: boolean;
}
const empty: Progress = { fixes: [], drafts: [], decisions: [], edits: {} };
const ProgressCtx = createContext<Ctx>({ progress: empty, has: () => false, toggle: () => {}, setEdit: () => {}, readOnly: true });

/** Progress (ticked fixes, approved drafts, decisions, draft edits) saved to the account, updated optimistically. */
export function ProgressProvider({ id, initial, readOnly, children }: { id: string; initial?: Progress; readOnly: boolean; children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>({ ...empty, ...(initial ?? {}) });
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => setProgress({ ...empty, ...(initial ?? {}) }), [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = useCallback((body: object) => {
    if (readOnly) return;
    void fetch(`/api/analyses/${id}/progress`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => {});
  }, [id, readOnly]);

  const toggle = useCallback((kind: Kind, key: string) => {
    setProgress((p) => {
      const on = !p[kind].includes(key);
      send({ kind, key, value: on });
      return { ...p, [kind]: on ? [...p[kind], key] : p[kind].filter((k) => k !== key) };
    });
  }, [send]);

  const setEdit = useCallback((key: string, value: string | null) => {
    setProgress((p) => {
      const edits = { ...p.edits };
      if (value == null) delete edits[key];
      else edits[key] = value;
      return { ...p, edits };
    });
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => send({ kind: "edits", key, value }), 700);
  }, [send]);

  return (
    <ProgressCtx.Provider value={{ progress, has: (k, key) => progress[k].includes(key), toggle, setEdit, readOnly }}>
      {children}
    </ProgressCtx.Provider>
  );
}
export const useProgress = () => useContext(ProgressCtx);

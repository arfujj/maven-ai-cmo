"use client";
import { useCallback, useEffect, useState } from "react";
import type { Analysis, Place } from "@/lib/types";

export const fmt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-US"));
export const domainOf = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** A set of ids remembered per viewer in localStorage (done fixes, approved drafts, decisions). */
export function useLocalSet(key: string) {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      /* storage unavailable */
    }
  }, [key]);
  const toggle = useCallback(
    (id: string) =>
      setItems((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      }),
    [key],
  );
  return { items, has: (id: string) => items.includes(id), toggle };
}

export function useLocalMap(key: string) {
  const [map, setMap] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      setMap(JSON.parse(localStorage.getItem(key) || "{}"));
    } catch {
      /* storage unavailable */
    }
  }, [key]);
  const set = useCallback(
    (id: string, value: string | null) =>
      setMap((prev) => {
        const next = { ...prev };
        if (value == null) delete next[id];
        else next[id] = value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      }),
    [key],
  );
  return { map, set };
}

/** "1-2", "Weeks 5–13", "week 3" -> [start, end] clamped to 1..13 */
export function parseWeeks(s: string): [number, number] {
  const nums = (s.match(/\d+/g) ?? []).map(Number).filter((n) => n >= 1 && n <= 52);
  if (!nums.length) return [1, 13];
  const a = Math.min(13, nums[0]);
  const b = Math.min(13, Math.max(a, nums[nums.length - 1]));
  return [a, b];
}

export function rivalsSummary(a: Analysis) {
  const rivals: Place[] = a.data.competitors ?? [];
  const top = [...rivals].sort((x, y) => (y.reviewCount ?? 0) - (x.reviewCount ?? 0)).slice(0, 3);
  const rated = top.filter((r) => r.rating != null);
  const avgRating = rated.length ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length : null;
  const avgReviews = top.length ? Math.round(top.reduce((s, r) => s + (r.reviewCount ?? 0), 0) / top.length) : null;
  const all = [...(a.data.google ? [a.data.google] : []), ...rivals];
  const rank = a.data.google ? [...all].sort((x, y) => (y.reviewCount ?? 0) - (x.reviewCount ?? 0)).findIndex((p) => p.id === a.data.google!.id) + 1 : null;
  return { rivals, avgRating, avgReviews, rank, total: all.length };
}

export function Stat({ label, value, sub, icon: Icon, children, accent }: { label: string; value?: React.ReactNode; sub?: React.ReactNode; icon?: React.ComponentType<{ className?: string }>; children?: React.ReactNode; accent?: React.ReactNode }) {
  return (
    <div className="panel flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
          {Icon && <Icon className="size-3.5" />}
          {label}
        </span>
        {accent}
      </div>
      {children ?? (
        <div className="min-w-0">
          <div className="tabular truncate text-2xl font-semibold tracking-tight">{value}</div>
          {sub && <div className="mt-1 truncate text-[13px] text-muted">{sub}</div>}
        </div>
      )}
    </div>
  );
}

"use client";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileQuestion, RotateCw } from "lucide-react";
import type { AnalysisView as Analysis } from "@/lib/types";
import { ButtonLink, EmptyState } from "@/components/ui";
import { Live } from "@/components/report/Live";
import { ReportView } from "@/components/report/ReportView";

function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3"><div className="skeleton size-12 rounded-lg" /><div className="grid grid-cols-1 gap-2"><div className="skeleton h-5 w-56" /><div className="skeleton h-3.5 w-40" /></div></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}</div>
      <div className="skeleton mt-6 h-40 rounded-xl" />
    </div>
  );
}

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [a, setA] = useState<Analysis | null>(null);
  const [missing, setMissing] = useState(false);
  const wasRunning = useRef(false);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const r = await fetch(`/api/analyses/${id}`, { cache: "no-store" });
        if (r.status === 404) return setMissing(true);
        const d: Analysis = await r.json();
        if (stop) return;
        setA(d);
        const running = d.status === "queued" || d.status === "running";
        if (running) {
          wasRunning.current = true;
          timer = setTimeout(poll, 1500);
        } else if (wasRunning.current) {
          router.refresh(); // update the sidebar score
          wasRunning.current = false;
        }
      } catch {
        if (!stop) timer = setTimeout(poll, 4000);
      }
    };
    void poll();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [id, router]);

  if (missing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <EmptyState icon={FileQuestion} title="Analysis not found" action={<ButtonLink href="/dashboard" variant="primary">Back to dashboard</ButtonLink>}>
          It may have been deleted, or it belongs to another account.
        </EmptyState>
      </div>
    );
  }
  if (!a) return <Loading />;
  if (a.status === "queued" || a.status === "running") return <Live a={a} />;
  if (a.status === "failed") {
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <EmptyState
          icon={AlertTriangle}
          title="This analysis couldn't finish"
          action={<ButtonLink href={`/start?url=${encodeURIComponent(a.input.url)}`} variant="primary"><RotateCw className="size-4" /> Try again</ButtonLink>}
        >
          {a.error ?? "Something went wrong while reading the business."}
        </EmptyState>
      </div>
    );
  }
  return <ReportView a={a} />;
}

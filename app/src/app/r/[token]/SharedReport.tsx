"use client";
import { ArrowRight, Inbox, Lock, Target } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { ButtonLink, Logo, ThemeToggle } from "@/components/ui";
import { ReportView } from "@/components/report/ReportView";

export function SharedReport({ a, betCount, draftCount }: { a: Analysis; betCount: number; draftCount: number }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <ButtonLink href="/start" variant="primary" size="sm">Check your business <ArrowRight className="size-3.5" /></ButtonLink>
          </div>
        </div>
      </header>

      <ReportView a={a} mode="public" />

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        {betCount > 0 && (
          <div className="panel grid gap-6 overflow-hidden p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-muted"><Lock className="size-3.5" /> Also prepared for {a.input.businessName}</div>
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm"><Target className="size-4 text-brand" /> A {betCount}-step, 90-day plan</span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm"><Inbox className="size-4 text-brand" /> {draftCount} drafts ready to approve</span>
              </div>
              <p className="mt-3 text-sm text-muted">Ask whoever shared this report to walk you through the plan.</p>
            </div>
            <ButtonLink href="/start" variant="brand" size="lg">Analyze another business</ButtonLink>
          </div>
        )}
        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-subtle">
          Made by Maven from public information: the business&apos;s website, Google&apos;s public business data and Google PageSpeed, read on {new Date(a.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}. Anything that couldn&apos;t be read is marked unknown rather than estimated.
        </p>
      </div>
    </div>
  );
}

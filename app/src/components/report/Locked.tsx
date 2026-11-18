"use client";
import { Lock, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui";

export function Locked({ title, text }: { title: string; text: string }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><Lock className="size-5" /></span>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">{text}</p>
      <ButtonLink href="/settings#plan" variant="brand" className="mt-6"><Sparkles className="size-4" /> See plans</ButtonLink>
    </div>
  );
}

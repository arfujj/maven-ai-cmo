"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/components/ui";

interface Msg { role: "user" | "assistant"; content: string }

const STARTERS = [
  "Why is this my biggest leak?",
  "What should I do this week?",
  "How do I beat my top competitor?",
  "Write a reply to my latest review",
];

export function ChatDrawer({ id, business, open, onClose }: { id: string; business: string; open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);
  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    const next = [...msgs, { role: "user" as const, content: question }];
    setMsgs(next);
    setText("");
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/analyses/${id}/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Maven couldn't answer");
      setMsgs([...next, { role: "assistant", content: d.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Maven couldn't answer");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Ask Maven">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close chat" />
      <div className="fade-up absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-line bg-surface shadow-lg">
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-brand"><Sparkles className="size-3.5" /></span>
            <div>
              <div className="text-sm font-semibold">Ask Maven</div>
              <div className="text-[12px] text-muted">About {business}</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-bg-subtle hover:text-fg" aria-label="Close"><X className="size-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {msgs.length === 0 ? (
            <div>
              <p className="text-sm text-muted">Ask anything about this analysis. Maven answers from what it read about the business, never from guesses.</p>
              <div className="mt-4 grid gap-2">
                {STARTERS.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)} className="rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-left text-sm text-fg-2 transition-colors hover:border-line-strong hover:text-fg">{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {msgs.map((m, i) => (
                <div key={i} className={cn("fade-up", m.role === "user" ? "ml-10 rounded-xl bg-fg px-3.5 py-2.5 text-sm text-bg" : "text-sm")}>
                  {m.role === "user" ? m.content : <div className="[&_.md]:text-sm [&_.md_h1]:text-base [&_.md_h2]:mt-3 [&_.md_h2]:border-0 [&_.md_h2]:pt-0 [&_.md_h2]:text-sm"><Markdown>{m.content}</Markdown></div>}
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-1.5 text-sm text-muted">
                  <span className="pulse-dot size-1.5 rounded-full bg-brand" /><span className="pulse-dot size-1.5 rounded-full bg-brand [animation-delay:.2s]" /><span className="pulse-dot size-1.5 rounded-full bg-brand [animation-delay:.4s]" />
                  <span className="ml-1">Thinking</span>
                </div>
              )}
              {error && <p className="text-sm text-bad">{error}</p>}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <form
          className="border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(text);
          }}
        >
          <div className="flex items-end gap-2 rounded-xl border border-line bg-surface-2 p-1.5 focus-within:border-brand focus-within:shadow-[0_0_0_3px_var(--ring)]">
            <label htmlFor="ask-maven" className="sr-only">Your question</label>
            <textarea
              id="ask-maven"
              ref={inputRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void ask(text);
                }
              }}
              placeholder="Ask about your fixes, rivals or plan…"
              className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-subtle"
            />
            <button type="submit" disabled={!text.trim() || busy} className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-fg text-bg disabled:opacity-40" aria-label="Send">
              <ArrowUp className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

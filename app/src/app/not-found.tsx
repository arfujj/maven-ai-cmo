"use client";
import { FileQuestion } from "lucide-react";
import { ButtonLink, EmptyState, Logo } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6"><Logo /></header>
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 pb-24">
        <div className="w-full">
          <EmptyState icon={FileQuestion} title="Page not found" action={<ButtonLink href="/" variant="primary">Go home</ButtonLink>}>
            The link may be broken, or the report is no longer shared.
          </EmptyState>
        </div>
      </main>
    </div>
  );
}

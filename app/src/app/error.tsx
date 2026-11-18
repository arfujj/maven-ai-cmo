"use client";
import { AlertTriangle } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <div className="w-full">
        <EmptyState icon={AlertTriangle} title="Something went wrong" action={<Button variant="primary" onClick={reset}>Try again</Button>}>
          The page hit an unexpected error. Your analyses are safe.
        </EmptyState>
      </div>
    </div>
  );
}

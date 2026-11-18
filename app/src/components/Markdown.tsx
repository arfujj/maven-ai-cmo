"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders a deliverable. Links open in a new tab; raw HTML is not rendered. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a> }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

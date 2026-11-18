export const TABS = [
  ["overview", "Overview"],
  ["competitors", "Competitors"],
  ["website", "Website & mobile"],
  ["plan", "90-day plan"],
  ["drafts", "Drafts"],
  ["toolkit", "Toolkit"],
  ["sources", "Sources"],
] as const;
export type TabId = (typeof TABS)[number][0];
export const PUBLIC_TABS: TabId[] = ["overview", "competitors", "website"];

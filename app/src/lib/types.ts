import { z } from "zod";

export const GOALS = {
  calls: "More calls and booked jobs",
  reviews: "More and better reviews",
  found: "Show up on Google",
  ads: "Get more from my ads",
  leads: "More leads and enquiries",
} as const;
export type GoalKey = keyof typeof GOALS;

export const BUDGETS = {
  none: "Nothing yet",
  under1k: "Under $1k a month",
  "1to5k": "$1k to $5k a month",
  over5k: "Over $5k a month",
} as const;
export type BudgetKey = keyof typeof BUDGETS;

export const AnalysisInput = z.object({
  url: z.string().min(4).max(300),
  businessName: z.string().min(1).max(120),
  location: z.string().min(1).max(120),
  goal: z.enum(Object.keys(GOALS) as [GoalKey, ...GoalKey[]]),
  budget: z.enum(Object.keys(BUDGETS) as [BudgetKey, ...BudgetKey[]]),
  runsAds: z.boolean(),
  monthlyJobs: z.string().max(40).optional().default(""),
  knownCompetitors: z.string().max(300).optional().default(""),
});
export type AnalysisInput = z.infer<typeof AnalysisInput>;

export type StepId = "site" | "phone" | "google" | "ai" | "competitors" | "customers" | "diagnose" | "plan";
export type StepStatus = "pending" | "running" | "done" | "skipped" | "failed";

export interface Step {
  id: StepId;
  label: string;
  status: StepStatus;
  startedAt?: string;
  finishedAt?: string;
  /** Short, user-facing findings that stream into the live view. */
  highlights: string[];
  note?: string;
}

export const STEP_LABELS: Record<StepId, string> = {
  site: "Reading your website",
  phone: "Checking your first screen on a phone",
  google: "Finding your Google Business Profile",
  ai: "Checking AI search readiness",
  competitors: "Sizing up who shows up first",
  customers: "Reading what your customers say",
  diagnose: "Scoring the six stages",
  plan: "Writing your 90-day plan and drafts",
};

// ---------- Collected facts ----------

export interface SitePage { url: string; title: string; h1: string; text: string }
export interface SiteFacts {
  finalUrl: string;
  pages: SitePage[];
  phones: string[];
  schemaTypes: string[];
  hasLocalBusinessSchema: boolean;
  metaDescription: string;
  fetchError?: string;
}

export const BusinessFacts = z.object({
  category: z.string(),
  services: z.array(z.string()).max(12),
  serviceArea: z.array(z.string()).max(12),
  phone: z.string().nullable(),
  promise: z.string().nullable(),
  offer: z.string().nullable(),
  proof: z.array(z.string()).max(8),
  callsToAction: z.array(z.string()).max(6),
  hours: z.string().nullable(),
  differentiators: z.array(z.string()).max(6),
  gaps: z.array(z.string()).max(8),
});
export type BusinessFacts = z.infer<typeof BusinessFacts>;

export const FirstScreen = z.object({
  phoneVisible: z.boolean(),
  phoneTappable: z.boolean().nullable(),
  promise: z.string().nullable(),
  headlineSaysWhatAndWhere: z.boolean(),
  proof: z.string().nullable(),
  cta: z.string().nullable(),
  clutter: z.array(z.string()).max(5),
  score: z.number().min(0).max(10),
  verdict: z.string(),
});
export type FirstScreen = z.infer<typeof FirstScreen>;

export interface PhoneFacts {
  screenshot: string | null; // data URI
  performance: number | null; // 0-100
  lcpSeconds: number | null;
  cls: number | null;
  firstScreen: FirstScreen | null;
}

export interface PlaceReview { rating: number; text: string; relativeTime: string; author?: string }
export interface Place {
  id: string;
  name: string;
  rating: number | null;
  reviewCount: number | null;
  address: string | null;
  website: string | null;
  phone: string | null;
  mapsUrl: string | null;
  primaryType: string | null;
  reviews: PlaceReview[];
  hasHours: boolean;
  photoCount: number;
}

export interface AiReadiness {
  blockedBots: string[];
  allowedBots: string[];
  hasRobots: boolean;
  hasSitemap: boolean;
  hasLlmsTxt: boolean;
  hasLocalBusinessSchema: boolean;
  napConsistent: boolean | null;
}

export const CustomerVoice = z.object({
  praise: z.array(z.object({ theme: z.string(), quote: z.string() })).max(5),
  complaints: z.array(z.object({ theme: z.string(), quote: z.string() })).max(5),
  words: z.array(z.string()).max(10),
  competitorComplaints: z.array(z.object({ competitor: z.string(), theme: z.string(), quote: z.string() })).max(6),
});
export type CustomerVoice = z.infer<typeof CustomerVoice>;

// ---------- Brain outputs ----------

export const STAGE_KEYS = ["found", "chosen", "call", "answered", "closed", "back"] as const;
export type StageKey = (typeof STAGE_KEYS)[number];
export const STAGE_NAMES: Record<StageKey, string> = {
  found: "Found",
  chosen: "Chosen",
  call: "Call",
  answered: "Answered",
  closed: "Closed",
  back: "Back",
};
export const STAGE_QUESTIONS: Record<StageKey, string> = {
  found: "Do they show up when people search?",
  chosen: "Next to rivals, do they win the click?",
  call: "Does a visit turn into a call or form?",
  answered: "Does someone pick up fast?",
  closed: "Does the quote become a job?",
  back: "Do customers return and refer?",
};

export const Diagnosis = z.object({
  summary: z.string(),
  overallScore: z.number().min(0).max(100),
  northStar: z.object({ metric: z.string(), baseline: z.string().nullable(), why: z.string() }),
  stages: z
    .array(
      z.object({
        key: z.enum(STAGE_KEYS),
        score: z.number().min(0).max(10).nullable(),
        status: z.enum(["strong", "watch", "leak", "unknown"]),
        headline: z.string(),
        evidence: z.array(z.string()).max(4),
      }),
    )
    .length(6),
  biggestLeak: z.enum(STAGE_KEYS),
  topFixes: z
    .array(
      z.object({
        title: z.string(),
        why: z.string(),
        evidence: z.string(),
        stage: z.enum(STAGE_KEYS),
        impact: z.enum(["high", "medium", "low"]),
        effort: z.string(),
        who: z.string(),
        skill: z.string(),
      }),
    )
    .min(1)
    .max(3),
  strengths: z.array(z.string()).max(4),
  competitorTakeaways: z.array(z.string()).max(4),
});
export type Diagnosis = z.infer<typeof Diagnosis>;

export const Plan = z.object({
  target: z.string(),
  bets: z
    .array(
      z.object({
        title: z.string(),
        why: z.string(),
        skill: z.string(),
        leadingIndicator: z.string(),
        keepOrKill: z.string(),
        weeks: z.string(),
        who: z.string(),
      }),
    )
    .min(3)
    .max(5),
  notDoing: z.array(z.object({ title: z.string(), why: z.string() })).max(4),
  weeks: z.array(z.object({ range: z.string(), focus: z.string(), ships: z.array(z.string()).max(5) })).min(3).max(6),
  budget: z.array(z.object({ line: z.string(), share: z.string(), note: z.string() })).max(6),
  decisions: z.array(z.string()).max(3),
  drafts: z
    .array(
      z.object({
        kind: z.enum(["first-screen", "google-post", "review-request", "review-reply", "ad", "follow-up"]),
        title: z.string(),
        body: z.string(),
        note: z.string(),
      }),
    )
    .min(3)
    .max(8),
});
export type Plan = z.infer<typeof Plan>;

// ---------- The analysis record ----------

export interface Analysis {
  id: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  status: "queued" | "running" | "done" | "failed";
  input: AnalysisInput;
  steps: Step[];
  error?: string;
  costUsd: number;
  /** Set when the owner turns on a public, read-only link. */
  shareToken?: string;
  /** Work produced by Toolkit runs for this business. */
  deliverables?: Deliverable[];
  /** What the owner has ticked off, approved or edited. */
  progress?: Progress;
  data: {
    site?: SiteFacts;
    business?: BusinessFacts;
    phone?: PhoneFacts;
    google?: Place | null;
    competitors?: Place[];
    ai?: AiReadiness;
    customers?: CustomerVoice;
    diagnosis?: Diagnosis;
    plan?: Plan;
  };
  sources: { label: string; url?: string }[];
}

export interface Deliverable {
  id: string;
  toolId: string;
  title: string;
  inputs: Record<string, string>;
  markdown: string;
  createdAt: string;
  costUsd: number;
}

export interface Progress {
  fixes: string[];
  drafts: string[];
  decisions: string[];
  edits: Record<string, string>;
}
export const emptyProgress = (): Progress => ({ fixes: [], drafts: [], decisions: [], edits: {} });

// ---------- Find clients (agency prospecting) ----------
export interface Prospect {
  id: string;
  name: string;
  rating: number | null;
  reviewCount: number | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  mapsUrl: string | null;
  hasHours: boolean;
  photoCount: number;
  siteReachable: boolean | null;
  siteHasTapToCall: boolean | null;
  siteHttps: boolean | null;
  /** 0-100: how much this business is likely losing. Higher = better prospect. */
  opportunity: number;
  reasons: string[];
  pitch?: string;
}

export interface ProspectList {
  id: string;
  kind: "prospects";
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  status: "running" | "done" | "failed";
  trade: string;
  town: string;
  prospects: Prospect[];
  error?: string;
  costUsd: number;
}

/** What the report page receives: the analysis plus history and what the plan unlocks. */
export interface AnalysisView extends Analysis {
  history?: { id: string; createdAt: string; score: number }[];
  access?: { fullReport: boolean; tools: boolean; share: boolean; chat: boolean; planLocked: boolean };
}

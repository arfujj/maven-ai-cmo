// Plans and what each unlocks. Prices are placeholders: change them here and create matching
// recurring prices in Stripe (STRIPE_PRICE_PRO, STRIPE_PRICE_AGENCY).

export type PlanId = "free" | "pro" | "agency";

export interface PlanLimits {
  analysesPerMonth: number;
  fullReport: boolean; // 90-day plan + drafts
  tools: boolean;
  share: boolean;
  prospects: boolean;
  chat: boolean;
}

export interface Plan extends PlanLimits {
  id: PlanId;
  name: string;
  price: number;
  tagline: string;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "See what's costing you calls",
    analysesPerMonth: 1,
    fullReport: false,
    tools: false,
    share: false,
    prospects: false,
    chat: false,
    features: ["1 analysis a month", "Score for all six stages", "Your top 3 fixes", "Competitor and phone checks"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 49,
    tagline: "For a business running its own marketing",
    analysesPerMonth: 15,
    fullReport: true,
    tools: true,
    share: true,
    prospects: false,
    chat: true,
    features: ["15 analyses a month", "90-day plan and drafts", "All 26 Toolkit tools", "Ask Maven chat", "Share links and monthly re-checks"],
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: 149,
    tagline: "For agencies and freelancers with many clients",
    analysesPerMonth: 100,
    fullReport: true,
    tools: true,
    share: true,
    prospects: true,
    chat: true,
    features: ["100 analyses a month", "Everything in Pro", "Find clients: ranked local prospects", "Pitch emails for every prospect", "Client reports"],
  },
};

/** When billing is off (no Stripe keys), everything is unlocked. */
export const UNLIMITED: PlanLimits = { analysesPerMonth: 100000, fullReport: true, tools: true, share: true, prospects: true, chat: true };

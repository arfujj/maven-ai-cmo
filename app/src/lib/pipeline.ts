import "server-only";
import { randomUUID } from "crypto";
import { chatJson, models } from "./llm";
import { getAnalysis, saveAnalysis } from "./store";
import { collectSite } from "./collect/site";
import { collectPageSpeed, collectAiReadiness, findOwnPlace, findCompetitors, PlacesUnavailable } from "./collect/google";
import { BUSINESS_FACTS_PROMPT, FIRST_SCREEN_PROMPT, CUSTOMER_VOICE_PROMPT, DIAGNOSIS_PROMPT, PLAN_PROMPT } from "./prompts";
import {
  type Analysis,
  type AnalysisInput,
  type Step,
  type StepId,
  STEP_LABELS,
  BusinessFacts,
  FirstScreen,
  CustomerVoice,
  Diagnosis,
  Plan,
  GOALS,
  BUDGETS,
  STAGE_NAMES,
} from "./types";

const ORDER: StepId[] = ["site", "phone", "google", "ai", "competitors", "customers", "diagnose", "plan"];

export function newAnalysis(input: AnalysisInput, userId: string | null): Analysis {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now,
    status: "queued",
    input,
    steps: ORDER.map((id) => ({ id, label: STEP_LABELS[id], status: "pending", highlights: [] })),
    costUsd: 0,
    data: {},
    sources: [],
  };
}

class Skip extends Error {}

const fmtRating = (r: number | null, n: number | null) => (r == null ? "no rating" : `${r.toFixed(1)}★ from ${n ?? 0} reviews`);

export async function runAnalysis(id: string): Promise<void> {
  const a = await getAnalysis(id);
  if (!a || a.status === "done" || a.status === "running") return;
  a.status = "running";

  // Serialize writes so parallel steps never save out of order.
  let saving: Promise<void> = Promise.resolve();
  const save = () => (saving = saving.then(() => saveAnalysis(a)).catch((e) => console.error("[maven] save failed", e)));
  await save();

  const stepOf = (sid: StepId) => a.steps.find((s) => s.id === sid)!;
  const addCost = (c: number) => (a.costUsd = Math.round((a.costUsd + c) * 1e6) / 1e6);
  const source = (label: string, url?: string) => {
    if (!a.sources.some((s) => s.label === label && s.url === url)) a.sources.push({ label, url });
  };

  async function run(sid: StepId, fn: (s: Step) => Promise<void>) {
    const s = stepOf(sid);
    s.status = "running";
    s.startedAt = new Date().toISOString();
    await save();
    try {
      await fn(s);
      s.status = "done";
    } catch (err) {
      if (err instanceof Skip || err instanceof PlacesUnavailable) {
        s.status = "skipped";
        s.note = err.message;
      } else {
        s.status = "failed";
        s.note = err instanceof Error ? err.message.slice(0, 300) : String(err);
        console.error(`[maven] step ${sid} failed`, err);
      }
    }
    s.finishedAt = new Date().toISOString();
    await save();
  }

  const input = a.input;

  // ---- Stage 1: read the site, the phone screen and the Google profile in parallel ----
  const site = run("site", async (s) => {
    const facts = await collectSite(input.url);
    a.data.site = facts;
    if (facts.fetchError || !facts.pages.length) throw new Error(`Couldn't read the site: ${facts.fetchError ?? "no pages"}`);
    facts.pages.forEach((p) => source(`Website: ${p.title || new URL(p.url).pathname}`, p.url));
    s.highlights.push(`Read ${facts.pages.length} page${facts.pages.length > 1 ? "s" : ""}`);
    await save();
    const pagesText = facts.pages.map((p) => `### ${p.url}\nTITLE: ${p.title}\nH1: ${p.h1}\n${p.text}`).join("\n\n");
    const { value, costUsd } = await chatJson(BusinessFacts, {
      model: models.reader,
      system: BUSINESS_FACTS_PROMPT,
      user: `Business: ${input.businessName}, ${input.location}\nPhone numbers found in links: ${facts.phones.join(", ") || "none"}\nStructured data types: ${facts.schemaTypes.join(", ") || "none"}\nMeta description: ${facts.metaDescription}\n\n${pagesText}`,
      maxTokens: 12000,
      effort: "low",
    });
    addCost(costUsd);
    a.data.business = value;
    s.highlights.push(`Looks like: ${value.category}`);
    if (value.promise) s.highlights.push(`Main promise: “${value.promise}”`);
    s.highlights.push(value.phone ? `Phone on the site: ${value.phone}` : "No phone number found on the site");
    if (value.gaps[0]) s.highlights.push(`Missing: ${value.gaps.slice(0, 2).join("; ")}`);
  });

  const phone = run("phone", async (s) => {
    const ps = await collectPageSpeed(input.url.startsWith("http") ? input.url : `https://${input.url}`);
    source("Google PageSpeed Insights (mobile)", `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(input.url)}`);
    a.data.phone = { ...ps, firstScreen: null };
    if (ps.performance != null) s.highlights.push(`Mobile speed score ${ps.performance}/100`);
    if (ps.lcpSeconds != null) s.highlights.push(`Main content shows after ${ps.lcpSeconds}s on a phone`);
    await save();
    if (!ps.screenshot) throw new Skip("No phone screenshot came back");
    const { value, costUsd } = await chatJson(FirstScreen, {
      model: models.reader,
      system: FIRST_SCREEN_PROMPT,
      user: [
        { type: "image_url", image_url: { url: ps.screenshot } },
        { type: "text", text: `Business: ${input.businessName}, ${input.location}. Judge this first screen.` },
      ],
      maxTokens: 8000,
      effort: "low",
    });
    addCost(costUsd);
    a.data.phone.firstScreen = value;
    s.highlights.push(value.phoneVisible ? "Phone number is on the first screen" : "No phone number on the first screen");
    s.highlights.push(`First screen: ${value.score}/10. ${value.verdict}`);
  });

  const google = run("google", async (s) => {
    const own = await findOwnPlace(input.businessName, input.location, input.url);
    a.data.google = own;
    if (!own) {
      s.highlights.push("No Google Business Profile matched this business");
      return;
    }
    if (own.mapsUrl) source(`Google profile: ${own.name}`, own.mapsUrl);
    s.highlights.push(`Found your profile: ${fmtRating(own.rating, own.reviewCount)}`);
    if (!own.hasHours) s.highlights.push("No opening hours on the profile");
    s.highlights.push(`${own.photoCount >= 10 ? "10+" : own.photoCount} photos on the profile`);
  });

  // ---- Stage 2: things that need stage 1 ----
  const ai = site.then(() =>
    run("ai", async (s) => {
      const r = await collectAiReadiness(a.data.site?.finalUrl || input.url, a.data.site?.hasLocalBusinessSchema ?? false);
      a.data.ai = r;
      source("robots.txt, sitemap and llms.txt", new URL("/robots.txt", a.data.site?.finalUrl || `https://${input.url}`).toString());
      s.highlights.push(r.blockedBots.length ? `AI crawlers blocked: ${r.blockedBots.join(", ")}` : "ChatGPT, Claude and Perplexity crawlers can read the site");
      s.highlights.push(r.hasLocalBusinessSchema ? "Business details are marked up for search engines" : "No business markup (LocalBusiness schema) for search engines and AI");
      if (!r.hasSitemap) s.highlights.push("No sitemap found");
    }),
  );

  const competitors = Promise.all([site, google]).then(() =>
    run("competitors", async (s) => {
      if (a.data.google === undefined && stepOf("google").status === "skipped") throw new Skip("Connect Google Places to compare you with your map pack");
      const category = a.data.google?.primaryType || a.data.business?.category || "local business";
      const list = await findCompetitors(category, input.location, a.data.google ?? null, input.url);
      a.data.competitors = list;
      list.forEach((c) => c.mapsUrl && source(`Competitor: ${c.name}`, c.mapsUrl));
      if (!list.length) {
        s.highlights.push(`No competitors found for “${category} in ${input.location}”`);
        return;
      }
      const top = [...list].sort((x, y) => (y.reviewCount ?? 0) - (x.reviewCount ?? 0))[0];
      s.highlights.push(`Searched “${category} in ${input.location}”`);
      s.highlights.push(`Most-reviewed rival: ${top.name}, ${fmtRating(top.rating, top.reviewCount)}`);
      const counts = list.slice(0, 3).map((c) => c.reviewCount ?? 0);
      const avg = Math.round(counts.reduce((x, y) => x + y, 0) / Math.max(1, counts.length));
      const mine = a.data.google?.reviewCount;
      if (mine != null) s.highlights.push(`You have ${mine} reviews; the top 3 average ${avg}`);
    }),
  );

  const customers = Promise.all([google, competitors]).then(() =>
    run("customers", async (s) => {
      const own = a.data.google?.reviews ?? [];
      const rivals = (a.data.competitors ?? []).flatMap((c) => c.reviews.filter((r) => r.rating <= 3).map((r) => ({ ...r, competitor: c.name })));
      if (!own.length && !rivals.length) throw new Skip("No public reviews to read yet");
      const { value, costUsd } = await chatJson(CustomerVoice, {
        model: models.reader,
        system: CUSTOMER_VOICE_PROMPT,
        user: `Business: ${input.businessName}\n\nTHIS BUSINESS'S REVIEWS:\n${own.map((r) => `- (${r.rating}★, ${r.relativeTime}) ${r.text}`).join("\n") || "none"}\n\nCOMPETITORS' LOW-RATED REVIEWS:\n${rivals.map((r) => `- [${r.competitor}] (${r.rating}★) ${r.text}`).join("\n") || "none"}`,
        maxTokens: 10000,
        effort: "low",
      });
      addCost(costUsd);
      a.data.customers = value;
      if (value.praise[0]) s.highlights.push(`Customers love: ${value.praise[0].theme}`);
      if (value.praise[0]) s.highlights.push(`“${value.praise[0].quote}”`);
      if (value.competitorComplaints[0]) s.highlights.push(`Rivals get complaints about: ${value.competitorComplaints[0].theme}`);
    }),
  );

  await Promise.all([site, phone, google, ai, competitors, customers]);

  // ---- Stage 3: the brain ----
  const evidence = buildEvidence(a);

  await run("diagnose", async (s) => {
    const { value, costUsd } = await chatJson(Diagnosis, {
      model: models.brain,
      system: DIAGNOSIS_PROMPT,
      user: evidence,
      maxTokens: 24000,
      effort: "medium",
      timeoutMs: 300_000,
    });
    addCost(costUsd);
    // Keep the stage order fixed whatever the model returned.
    value.stages.sort((x, y) => ["found", "chosen", "call", "answered", "closed", "back"].indexOf(x.key) - ["found", "chosen", "call", "answered", "closed", "back"].indexOf(y.key));
    a.data.diagnosis = value;
    s.highlights.push(`Overall: ${value.overallScore}/100`);
    s.highlights.push(`Biggest leak: ${STAGE_NAMES[value.biggestLeak]}`);
    value.topFixes.forEach((f, i) => s.highlights.push(`Fix ${i + 1}: ${f.title}`));
  });

  await run("plan", async (s) => {
    if (!a.data.diagnosis) throw new Skip("The plan needs the diagnosis, which didn't finish");
    const { value, costUsd } = await chatJson(Plan, {
      model: models.brain,
      system: PLAN_PROMPT,
      user: `${evidence}\n\nDIAGNOSIS:\n${JSON.stringify(a.data.diagnosis)}`,
      maxTokens: 32000,
      effort: "medium",
      timeoutMs: 300_000,
    });
    addCost(costUsd);
    a.data.plan = value;
    s.highlights.push(`${value.bets.length} bets over 13 weeks`);
    s.highlights.push(`${value.drafts.length} drafts ready to approve`);
  });

  a.status = a.data.diagnosis ? "done" : "failed";
  if (!a.data.diagnosis) a.error = "We couldn't gather enough to score this business. Check the website address and try again.";
  await save();
  await saving;
}

/** A compact, model-ready evidence pack. Screenshots and raw page text stay out. */
export function buildEvidence(a: Analysis): string {
  const { input, data } = a;
  const place = (p: NonNullable<Analysis["data"]["google"]>) => ({
    name: p.name,
    rating: p.rating,
    reviewCount: p.reviewCount,
    type: p.primaryType,
    hasHours: p.hasHours,
    // Google returns at most 10 photos, so 10 means "10 or more", not an exact count.
    photos: p.photoCount >= 10 ? "10 or more (exact count not available)" : p.photoCount,
    website: p.website,
    phone: p.phone,
  });
  const pack = {
    owner: {
      business: input.businessName,
      location: input.location,
      website: input.url,
      mainGoal: GOALS[input.goal],
      monthlyMarketingSpend: BUDGETS[input.budget],
      runsAds: input.runsAds,
      bookedJobsPerMonth: input.monthlyJobs || "not given",
      competitorsTheyNamed: input.knownCompetitors || "none",
    },
    website: data.site
      ? { pagesRead: data.site.pages.map((p) => p.url), phones: data.site.phones, structuredData: data.site.schemaTypes, error: data.site.fetchError }
      : "not read",
    businessFacts: data.business ?? "not available",
    phoneFirstScreen: data.phone
      ? { mobileSpeedScore: data.phone.performance, mainContentSeconds: data.phone.lcpSeconds, layoutShift: data.phone.cls, check: data.phone.firstScreen }
      : "not available",
    googleProfile: data.google ? place(data.google) : data.google === null ? "no profile matched" : "not checked (Google Places not connected)",
    competitorsInMapPack: data.competitors?.map(place) ?? "not checked",
    customerVoice: data.customers ?? "not available",
    aiSearchReadiness: data.ai ?? "not checked",
    stepsThatCouldNotRun: a.steps.filter((s) => s.status === "skipped" || s.status === "failed").map((s) => `${s.label}: ${s.note}`),
  };
  return `EVIDENCE (everything we know; anything absent is unknown):\n${JSON.stringify(pack, null, 1)}`;
}

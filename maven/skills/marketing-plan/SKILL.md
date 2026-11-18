---
name: marketing-plan
description: Writes the 90-day marketing plan a fractional CMO would hand an owner. One number to move, where the customer journey breaks, three to five ranked bets each mapped to the Maven skill that does the work, a budget split, the season ahead, and keep-or-kill rules. Built for local service businesses and the agencies that run them, and it works for any business. Use when someone asks for a marketing plan, a 90-day plan, a quarterly plan, where to spend the budget, or what to focus on this quarter.
when_to_use: marketing plan, 90 day plan, 90-day marketing plan, quarterly marketing plan, write my marketing plan, build a marketing plan, plan for next quarter, where should my marketing budget go, how should I split my budget, how much should I spend on marketing, marketing roadmap, what should we focus on this quarter, set our marketing goal, busy season plan, slow season plan
argument-hint: "[goal or number to move] [monthly budget] | refresh"
metadata:
  maven:
    version: 1.0.0
    layer: strategy
    reads: [brand-manifest, positioning#chosen-angle, competitors, audience, learnings, assets, stack]
    writes: [plan]
    optional-keys: [GOOGLE_APPLICATION_CREDENTIALS, GSC_SITE_URL]
    enhances_with:
      - toolset: search-console
        gains: "the baseline uses the real searches that already find the business"
      - toolset: analytics
        gains: "the baseline uses real visits and form fills instead of the owner's estimate"
---

# Marketing Plan

You are the CMO the business can't afford to hire full time. The job is one page an owner
reads in five minutes and a team can run for 13 weeks: the one number that matters, the
point where customers are leaking, the few bets worth making in order, what they cost,
and when to keep or kill each one. Done means every bet names the Maven skill that does
the work, every number is either measured or marked as an estimate with its math shown,
and the owner can say yes or no to it in one sitting. A plan of twelve priorities is a
list of chores. Three to five, in order, is a plan.

Hard rules: no invented baselines or forecasts (an unknown baseline is written as
unknown, and week one measures it); nothing is booked, bought, published or sent by this
skill; the budget is the owner's and never exceeds what they stated.

## Context

Only if `./brand/`, `./brands/` or `MARKETING.md` exists (nothing to load otherwise), run:
`python3 ${CLAUDE_SKILL_DIR}/../cmo/scripts/brand_context.py --for marketing-plan`
(`${CLAUDE_SKILL_DIR}` is this skill's folder; outside Claude Code use the folder this
file was read from, e.g. `.agents/skills/marketing-plan`. If the script or python3 is
unavailable, read the brand folder directly: `./brands/<slug>/` when `./brands/active`
names one, else `./brand/`; then `MARKETING.md`, `preferences.md` and the files in
`reads:`. If none exist, offer the 3-minute `/cmo` read first in one line; if the user
declines, plan from what they tell you and label the plan `Data: MODEL KNOWLEDGE`.)

Also look for the latest `./campaigns/audit/audit-*.md`, `./campaigns/site-audit-*/`,
`./campaigns/ai-search/audit-*.md` and any performance report. Prior diagnosis beats a
fresh guess: cite it rather than re-deriving it.

## Modes

| Trigger | Mode |
|---|---|
| Default: "marketing plan", "90-day plan", "what should we focus on" | **PLAN** (Phases 1-5) |
| "where should my budget go", "how should I split my budget" | **BUDGET** (Phase 1, then Phase 4 only, short) |
| "refresh the plan", a plan over 90 days old, or the number moved enough to change the bets | **REFRESH** (re-score the bets against `learnings.md`, keep what is working, replace what was killed) |

## Phase 1: The number and the baseline

Ask at most two questions, and only what the brand files can't answer:

1. **What one number should this plan move?** Offer the default for the business. Local
   service: booked jobs (or calls that became appointments) from marketing per month.
   Software: new paying customers or qualified demos. Shop: first orders. Agency's own
   marketing: signed retainers. Revenue is the outcome, not the number to steer by,
   because it lags by a sales cycle.
2. **What can you spend per month, ads plus tools, and how many hours a week can someone
   on your side give?** Hours matter as much as money for a local owner. A plan that
   needs 10 owner hours a week fails in week two.

**Baseline.** Use the business's own count first (the phone log, booking system, CRM,
orders), then platform numbers. If no count exists, the baseline is "unknown" and bet
zero is to start counting (`/google-ads-tracking` or the call-log recipe in
`/speed-to-lead`). Never fill a baseline from industry averages.

**The target** is a range with its math, not a wish: "from ~22 to 28-32 booked jobs a
month: +4 from answering missed calls (the call log shows ~9 missed a week), +2 to 6 from
review velocity". If the math doesn't reach the owner's hope, say so plainly.

## Phase 2: Where it breaks

Walk the customer's path and find the stage that leaks most. Name it with evidence, not
a feeling. For a local business the path is:

| Stage | The question | Evidence that settles it |
|---|---|---|
| Found | Do they show up where people look? | Map-pack position for `<trade> <town>`, the profile vs the top 3, AI answers naming them |
| Chosen | When seen next to rivals, do they win the click? | Rating and review count vs the top 3, reply rate, the first screen on a phone |
| Call | Does the visit turn into a call or form? | Number and promise on the first screen, tracking that counts calls |
| Answered | Does a person respond fast? | Missed-call share, time to first reply on forms |
| Closed | Does the quote become a job? | Quote follow-up, close rate the owner reports |
| Back | Do customers return and refer? | Review asks, maintenance plans, email to past customers |

For software and shops the same logic runs as found, chosen, sign-up or first order,
activation, retention.

**The leak rule (default):** fix the most downstream leak first. Traffic poured into a
site that doesn't get calls, or calls that go to voicemail, is money spent twice. A
business missing a third of its calls does not need more ads. Deviate when the upstream
stage is at zero (nobody can find them at all), and say why in one line.

Load `references/budget-judgment.md` when the plan includes spend.

## Phase 3: The bets

Draft five to eight candidate moves from the diagnosis, then keep three to five. Score
each candidate on three things, one to five each, and keep the reasoning one line long:

- **Impact on the number** if it works, using the Phase 1 math.
- **Confidence** it works here, from evidence in this business (a priced competitor gap,
  their own reviews, a learnings entry) rather than general best practice.
- **Ease** for this team, counting owner hours and money.

Rank by impact times confidence, with ease breaking ties. Then apply judgment the score
can't: sequence dependencies (tracking before ads, positioning before the landing page,
reviews before town pages in a market where every rival has 300), and keep one fast win
in the first two weeks, because an owner who sees one early result funds the rest.

Every bet carries:
- **The move** in plain words ("Answer every missed call with a text inside a minute").
- **Why this, now**: the evidence, one or two lines.
- **The skill**: the Maven skill or chain that does it (`/speed-to-lead`, then `/reviews`).
- **Who does what**: Maven drafts, the owner approves, someone on their side does the
  part only a person can (asks for reviews at the job, picks up the phone).
- **Leading indicator** you can see in two to three weeks, before the number moves.
- **Keep or kill rule**: written before launch. "Keep if missed calls fall below 10% by
  week 4; otherwise switch the text-back provider."

Then write **what we are not doing, and why**: the tempting moves that lost (a TikTok
channel, a rebrand, a second city). A plan's credibility lives in what it refuses.

## Phase 4: Money, hours and the season

**Budget.** Split only the money the owner stated. Default order for a local business:
measure (tracking, a call log) before spending; fix the leaks (cheap, and they raise the
return on every later dollar); then buy demand on the channel closest to intent, one
campaign before many. Hold back a slice for a test. Full judgment, including small-budget
rules and when Meta beats Google: `references/budget-judgment.md`.

**Hours.** Put the owner's weekly hours against each bet. If the total exceeds what they
said, cut a bet rather than hoping.

**Season.** Load `references/seasonality.md` for the trade. Put each bet where demand
helps it: build in the slow months, harvest in the busy ones. A roofing plan that launches
ads after storm season has wasted its best weeks. Treat the reference as a starting
pattern; the business's own call log and Search Console beat it, and a free Google Trends
check for the region confirms it.

## Phase 5: The 13 weeks

Lay the bets on a week-by-week line, with a checkpoint every four weeks. Each week names
what ships and who approves it. Fit the shape to the bets rather than forcing a template;
the usual shape for a local business is fix and measure (weeks 1-4), build what wins
choice and search (weeks 5-9), then add or scale demand on what proved out (weeks 10-13).

Close with **decisions needed from the owner** (three at most, each a yes or no with a
deadline) and the **operating rhythm**: the Monday `/weekly-brief`, the monthly
`/performance-review`, and the routine that watches the biggest risk.

Before handing over, check the plan against `references/plan-quality.md` silently and fix
every miss.

## Output

Follows the output contract (`${CLAUDE_SKILL_DIR}/../cmo/references/output-format.md`).

1. `./campaigns/plan/plan-<YYYY-MM-DD>.md`: the full plan. `## 90-DAY MARKETING PLAN:
   <brand>`, one line of date and purpose, then: The number, Where it breaks, The bets,
   Not doing, Budget and hours, The 13 weeks, Decisions needed, a short Sources and
   assumptions note. Plan budget: about 1,200 to 2,000 words. Scores and candidate lists
   go to `./campaigns/plan/notes-<YYYY-MM-DD>.md`, never the plan.
2. `./brand/plan.md`: the standing version every skill can read. Under 60 lines:
   `## The number` (metric, baseline, target range, dates), `## Bets` (a table: bet,
   skill, leading indicator, keep or kill rule, status), `## Not doing`, `## Budget`,
   `## Rhythm`. Version the old file to `./brand/.history/plan.<date>.md` first and add
   the `files:` entry to `brand.yaml` (owner: marketing-plan).
3. One line in `assets.md`.

In chat: the number and target in one line, the bets as a numbered list (one line each
with its skill), the owner decisions, then **Files saved** and **What's next**. Never
paste the plan.

## What's next

- The first bet's skill, named with its time estimate. This is the default.
- `/weekly-brief`: every Monday, the plan turns into this week's three moves (~5 min).
  Offer the weekly CMO brief routine in one line.
- `/performance-review` at the first four-week checkpoint, with the counts in hand.
- For an agency: `/client-report` uses this plan as the yardstick each month.

## When the user edits your work

Apply the edit, then make it stick: save a gold case to `./brand/gold/<this skill>/` and
one to three yes/no checks to `./brand/checks.md`, and confirm in one line. Before handing
over any work, answer the checks the context block loaded, silently, and fix every no.
How: `${CLAUDE_SKILL_DIR}/../cmo/references/taste-loop.md`.

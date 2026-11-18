---
name: client-report
description: Writes the monthly report an agency sends a business owner, in plain words. The number that matters against last month and the plan, what we did and why, what moved and what didn't, honest credit for each channel, next month's three moves, and what we need from the client. Built from the month's real counts, the plan, the work that shipped and the performance review. Use when an agency or freelancer needs a client report, a monthly report, a results recap, or a QBR summary.
when_to_use: client report, monthly client report, monthly report for my client, write the client report, results report, report to the owner, report for the business owner, what do I tell the client, recap for the client, quarterly business review, qbr, end of month report, retainer report
argument-hint: "[month, e.g. 2026-10] [paste the numbers or file paths] | --brand <slug>"
metadata:
  maven:
    version: 1.0.0
    layer: growth
    reads: [brand-manifest, plan, assets, learnings, positioning#chosen-angle]
    writes: []
    optional-keys: [GOOGLE_APPLICATION_CREDENTIALS, GSC_SITE_URL, GA4_PROPERTY_ID]
    enhances_with:
      - toolset: search-console
        gains: "search clicks and queries for the month come straight from Search Console"
      - toolset: analytics
        gains: "visits and form fills for the month come straight from analytics"
---

# Client Report

An owner reads a monthly report for one answer: is this working, and is it worth what I
pay? Most agency reports bury that answer under charts of impressions. This skill writes
the report a good account lead would, in the owner's words: the number they care about,
what we did, what it did, what we'll do next, and what we need from them. Done means the
owner can read it on a phone in three minutes and repeat the main point to their spouse
or business partner. Trust is the product; one inflated claim costs more than a flat
month honestly explained.

Hard rules: no number without a source (the client's own count, a platform export, a
read-only pull), and estimates carry `~`; no channel gets credit the client's own count
doesn't support; never invent work that wasn't done; nothing is sent. The agency sends it.

## Context

Run in the client's own brand folder. Only if `./brand/`, `./brands/` or `MARKETING.md`
exists (nothing to load otherwise), run:
`python3 ${CLAUDE_SKILL_DIR}/../cmo/scripts/brand_context.py --for client-report`
(`${CLAUDE_SKILL_DIR}` is this skill's folder; outside Claude Code use the folder this
file was read from, e.g. `.agents/skills/client-report`. If the script or python3 is
unavailable, read `./brands/<slug>/` when `./brands/active` names one, else `./brand/`;
then `preferences.md` and the files in `reads:`.)

If `./brands/` exists and no client is named or active, ask once which client. Never mix
two clients' files in one report.

## Gather

1. **The month's counts.** Ask for them if not given, in one message: calls or booked
   jobs (from the phone log, call tracking or booking system), form leads, and any
   platform exports (Google Ads, Meta, Search Console, the Google Business Profile
   performance screen). Accept screenshots and CSVs. Pull read-only data where keys
   allow.
2. **Last month's report** in `./campaigns/reports/`, for the comparison and to check
   last month's promised moves against what happened.
3. **The plan** (`plan.md`): the number, the target pace, the bets and their keep or
   kill rules.
4. **The work.** `assets.md` rows dated in the month, grouped into what an owner would
   recognize ("rewrote the drain cleaning page", not "landing-page BUILD").
5. **The diagnosis.** If `/performance-review` ran this month, use its report rather
   than re-deriving it. If it didn't and the numbers are substantial, run its method in
   brief (load `${CLAUDE_SKILL_DIR}/../performance-review/references/metrics-judgment.md`).

## Write

Load `references/report-craft.md` before writing. Structure, in order:

1. **The headline.** One sentence that answers "is it working": the number this month,
   last month, and the plan's pace. "41 booked jobs from marketing in October, up from
   33, ahead of the 38 the plan called for." A down month says so in the first line,
   with the reason if known.
2. **What we did.** Three to six lines, in the owner's words, each tied to a bet in the
   plan.
3. **What it did.** For each bet: the leading indicator and the number, compared to its
   keep or kill rule. Give credit only as far as the client's own count supports it, and
   name the doubt when a platform claims more than the phone log shows.
4. **What didn't work, and what we're changing.** At least one honest line every month.
   An owner trusts the report that admits a miss.
5. **Next month: three moves.** Each with why and what the owner will see.
6. **What we need from you.** Approvals, access, photos, the review ask at the job.
   Each a short action with a date.

Close with a short Sources and assumptions note (where each number came from and what
period). Keep agency jargon out entirely: no "CTR", "ROAS", "impressions", "SERP",
"attribution" in the body. If a term is unavoidable, say what it means in the same
sentence.

**Reconcile before you hand over.** Every number in the headline and "What it did"
appears in the notes file with its source and period. Totals add up. Last month's
promised moves are each accounted for (done, moved, or dropped with why).

## Output

Follows the output contract (`${CLAUDE_SKILL_DIR}/../cmo/references/output-format.md`).

- `./campaigns/reports/<YYYY-MM>-report.md`: `## MONTHLY REPORT: <client>, <Month YYYY>`,
  then the six sections and the note. Budget: about 400 to 800 words; a quarterly review
  ("QBR") runs to about 1,200 and adds a quarter-over-quarter line and the next quarter's
  bets from `plan.md`.
- `./campaigns/reports/<YYYY-MM>-notes.md`: every number with its source, the
  reconciliation, and anything left out of the report and why.
- One line in `assets.md`.

In chat: the headline sentence, the three next moves, what the client needs to do,
**Files saved**, **What's next**. The agency sends the report; offer a short cover email
of three to five lines in the agency's voice if asked.

## What's next

- `/performance-review`: if this month's numbers taught something, write it to
  learnings so next month's work applies it (~10 min).
- `/marketing-plan` REFRESH at a quarter end or when two bets hit their kill rule.
- The first of next month's moves, by its skill.
- First run for a client: offer the monthly client report routine in one line.

## When the user edits your work

Apply the edit, then make it stick: save a gold case to `./brand/gold/<this skill>/` and
one to three yes/no checks to `./brand/checks.md`, and confirm in one line. Before handing
over any work, answer the checks the context block loaded, silently, and fix every no.
How: `${CLAUDE_SKILL_DIR}/../cmo/references/taste-loop.md`.

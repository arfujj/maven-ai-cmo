# Maven app

Enter a website, watch Maven read the business live, and land on a dashboard: a score for the
six customer stages, the three fixes that matter most, you vs. your map pack, the phone first-screen
check, a 90-day plan and drafts ready to approve.

## What's in the app

| Area | What it does |
|---|---|
| **Businesses** | Every analyzed business with score, biggest leak and Google rating; a getting-started checklist for new users |
| **Analysis** | ~2 min live run: website, phone render, speed, Google profile, rivals, reviews, AI readiness → score, fixes, 90-day plan, drafts |
| **Report** | Overview, Competitors, Website & mobile, 90-day plan (roadmap chart), Drafts (edit/approve), Toolkit, Sources; share link, re-run, print, score history |
| **Ask Maven** | Chat on every report, answered only from that business's evidence |
| **Toolkit** | 26 tools, each running a real Maven skill (`./skills`) to produce a finished deliverable; "Do this" on every fix and plan step |
| **Find clients** | Agency prospecting: a trade + town → 20 businesses ranked by what they're losing, with a pitch email for each |
| **Settings** | Account, plan and usage, Stripe checkout and billing portal, theme |
| **Monthly re-check** | Vercel Cron (`vercel.json`) re-runs every business whose last analysis is 30+ days old |

Progress (ticked fixes, approved and edited drafts, decisions) is saved to the account.

## Plans and billing

Plans and prices live in `src/lib/plans.ts` (prices are placeholders). Billing is **off** until
`STRIPE_SECRET_KEY` is set; while off, every feature is unlocked. To turn it on:

1. In Stripe, create two recurring prices (Pro, Agency) and put their IDs in `STRIPE_PRICE_PRO` / `STRIPE_PRICE_AGENCY`.
2. Add a webhook to `https://your-domain.com/api/stripe/webhook` for `checkout.session.completed`,
   `customer.subscription.updated` and `customer.subscription.deleted`; put its signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Turn on the customer portal in Stripe (Settings → Billing → Customer portal).

A user's plan is stored in Supabase `app_metadata`, which only the server can change.

## Skills

The Toolkit reads Maven's skill playbooks from `./skills`. After editing `../maven/skills`, run
`node scripts/sync-skills.mjs`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3100
```

Keys live in `.env.local` (never committed). See `.env.example` for the list.

## How an analysis runs (~2 minutes, ~$0.02 on Claude Haiku 5.5)

| Step | Source | Model work |
|---|---|---|
| Read the website (home + up to 4 key pages) | Our server, with an SSRF guard | Haiku extracts the business facts |
| First screen on a phone + speed | Google PageSpeed (returns a real phone screenshot) | Haiku reads the screenshot |
| Google Business Profile | Google Places API (New) | none |
| AI search readiness | robots.txt, sitemap, llms.txt, schema | none |
| Competitors in the map pack | Google Places API (New) | none |
| What customers say | Google reviews (own + rivals' low-rated) | Haiku pulls verbatim quotes |
| Diagnosis, then plan + drafts | Everything above | Haiku (set `MAVEN_BRAIN_MODEL` to upgrade) |

Steps run in parallel where they can; a step that can't run is marked skipped and its stages are
scored "unknown" instead of guessed. Prompts in `src/lib/prompts.ts` are distilled from the Maven
skill library in `../maven/skills/`.

## Supabase (sign-in and storage)

Without Supabase the app runs in local mode: no sign-in, analyses saved to `.data/`.
To turn it on:

1. Put the project URL in `NEXT_PUBLIC_SUPABASE_URL`.
2. SQL Editor: run `supabase/schema.sql`.
3. Authentication → URL Configuration: Site URL `http://localhost:3100`, and add
   `http://localhost:3100/auth/callback` to Redirect URLs.
4. Optional: Authentication → Providers → Google, for "Continue with Google".

## Deploy (Vercel)

1. Push the `app/` folder to a GitHub repo and import it in Vercel (framework: Next.js).
2. Add every variable from `.env.example` in Vercel → Settings → Environment Variables, plus
   `NEXT_PUBLIC_APP_URL=https://your-domain.com` (used for share links, the sitemap and social cards).
3. Supabase → Authentication → URL Configuration: set the Site URL to your domain and add
   `https://your-domain.com/auth/callback` and `https://your-domain.com/auth/confirm` to Redirect URLs.
4. An analysis runs for about two minutes after the request returns (`after()` in
   `src/app/api/analyses/route.ts`, `maxDuration = 800`). That needs Vercel Pro with Fluid compute;
   on Hobby, move the runner to a queue (Inngest or Trigger.dev).
5. Supabase → Authentication → SMTP: connect your own sender (Resend works) so magic links aren't rate-limited.

`npm run build` passes locally; `npm run start` serves the production build on port 3100.

## Project map

| Path | What it is |
|---|---|
| `src/components/ui` | Design system: buttons, badges, panels, score ring, theme toggle |
| `src/components/marketing` | Landing page and the product mock-ups on it |
| `src/components/app` | Signed-in shell: sidebar, recent businesses, user menu |
| `src/components/report` | Report tabs: overview, competitors, website, plan, drafts, sources, live view |
| `src/app/(app)` | Dashboard, new analysis wizard, analysis page (sign-in required) |
| `src/app/r/[token]` | Public read-only shared report |
| `src/lib` | Pipeline, prompts, collectors, storage, auth helpers |

## Before going live

- Rotate every key that was ever pasted into a chat.
- Move the analysis runner to a job queue (Inngest or Trigger.dev) if you host on serverless;
  `after()` works on a normal Node server.
- Replace the in-memory rate limit in `src/app/api/analyses/route.ts` with a database-backed one.

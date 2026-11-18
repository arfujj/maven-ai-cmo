# Maven: your AI CMO

Maven runs your marketing the way a good chief marketing officer would. It reads the
business, picks the one number that matters, finds where customers are slipping away,
and ships the fix: the Google profile, the reviews, the page, the ads, the follow-up. Then
it keeps the rhythm every week.

It's built first for **local service businesses** (plumbers, roofers, HVAC, dentists,
med spas, lawyers) and **the agencies that market them**, and it works for software,
shops and creators too. 35 skills for Claude Code, Codex, Cursor and other agents. Every
skill works without a paid tool. Nothing is published, sent or spent without you.

## Install

Claude Code plugin (recommended: you get the hooks and the QA agent):

```
/plugin install maven --marketplace maven-cmo/maven
```

or in two steps:

```
/plugin marketplace add maven-cmo/maven
/plugin install maven@maven-cmo
```

Any agent (Claude Code, Codex, Cursor and others):

```bash
npx skills add maven-cmo/maven
```

Then type `/maven:cmo` (or `/cmo` on the npx path) and name the business, with the town
if it's local. Maven reads the site and the reviews, writes the brand memory every other
skill uses, and tells you the first move. About 3 minutes.

## Your first 30 minutes

1. **`/maven:cmo Hartline Plumbing, Dallas`** (a sample business). Maven reads the site,
   the Google rating and the top 3 in the map pack, and writes `./brand/`.
2. **Tell it what matters:** "more calls". It writes the 90-day plan around one number,
   booked jobs from marketing, with 3 to 5 bets in order (`/marketing-plan`).
3. **Run the first bet.** Usually it's the leak closest to the money: missed calls
   (`/speed-to-lead`), a phone number buried below the first screen
   (`/first-screen-check`), or a review count far behind the rivals (`/reviews`).
4. **Say "schedule it".** Every Monday you get a two-minute brief with this week's three
   moves (`/weekly-brief`).

## What makes it a CMO, not a skill pack

- **One number.** Every plan, brief and report is tied to the count the owner cares about
  (booked jobs, calls that became appointments), never to impressions.
- **Leak before traffic.** Maven fixes missed calls, a hidden phone number and thin
  reviews before it tells you to buy ads.
- **Memory.** `./brand/` holds the voice, positioning, customers' own words, competitors,
  the plan and what has worked. Every skill reads only what it needs, and the
  performance review writes what it learned so the next piece starts smarter.
- **Rhythm.** A quarterly plan, a Monday brief, a monthly review and, for agencies, the
  monthly client report. Routines run them on a schedule as drafts.
- **A second reader.** The `maven:qa` agent checks finished work for invented numbers,
  broken owner rules, promises the business can't keep and AI-sounding copy before you
  see it.
- **Agency-grade isolation.** One folder per client, an active-client pointer, and a hook
  that blocks a write into the wrong client's folder.

## The skills

Grouped the way a CMO thinks about them: run the marketing, then the stages a customer
moves through.

### Run the marketing (the CMO layer)

| Skill | What it does |
|---|---|
| `cmo` | The front door. Reads the business, writes the brand memory, routes any request, runs agency clients |
| `marketing-plan` | The 90-day plan: one number, where it leaks, 3-5 ranked bets, budget, season, keep or kill rules |
| `weekly-brief` | The Monday memo: the scoreboard, three moves for the week, decisions only the owner can make |
| `performance-review` | Reads the real numbers each month and writes what to keep, cut and test |
| `client-report` | The monthly report an agency sends the owner, in plain words, with honest credit |

### Know the market

| Skill | What it does |
|---|---|
| `brand-voice` | Pulls the voice from the site and reviews so every page and post sounds like the business |
| `positioning-angles` | Finds the angle and the offer that make them the obvious call |
| `audience-research` | Reads reviews, forums and competitors for the words customers actually use |
| `competitive-intel` | Sizes up the rivals that show up first, including what their customers complain about |

### Get found

| Skill | What it does |
|---|---|
| `google-business-profile` | Checks the Google profile against the top 3 in the map pack and writes a month of posts |
| `local-seo-plan` | Decides which services and towns get a page, which get a section, and which to skip |
| `service-area-pages` | Writes town and service pages that aren't the same page with the city swapped |
| `ai-search` | Checks whether ChatGPT, Perplexity and Google's AI name the business, and what to fix if they don't |
| `site-audit` | Crawls the site like Google and the AI crawlers do and ranks the few technical fixes that matter |
| `keyword-research` | Maps what people search, from free autocomplete data, as topics instead of a 5,000-row list |
| `seo-content` | Writes the articles and guides that answer those searches |
| `programmatic-seo` | Builds many pages from one template and a data set, without thin pages |

### Get chosen

| Skill | What it does |
|---|---|
| `reviews` | Finds where reviews stall, writes the owner replies, and sets up the ask after every job |
| `first-screen-check` | Looks at the site on a phone the way a customer does: number, promise and proof on the first screen? |
| `landing-page` | Builds a page for one service and one offer, phone first |
| `direct-response-copy` | Writes headlines, offers and pages that get the call |
| `lead-magnet` | Makes the checklist, quote calculator or guide people trade an email for |

### Get the call

| Skill | What it does |
|---|---|
| `speed-to-lead` | Finds missed calls and slow replies, then sets up the text-back and follow-up |
| `google-ads-tracking` | Makes Google Ads count calls and form fills, so it bids on real leads |
| `paid-ads` | Writes Google and Meta ads, the structure, the budget and the test plan |
| `meta-ads` | Sets up the Meta API, launches the campaign and proves the tracking fires |
| `ads-incrementality-check` | Runs a pause test against the phone log to see if the ads make the phone ring or only take credit |
| `creative` | Makes ad images and short videos with AI image and video models, scored before you see them |

### Bring them back

| Skill | What it does |
|---|---|
| `email-sequences` | Writes the welcome, quote follow-up, review ask and seasonal emails |
| `newsletter` | Plans and writes a newsletter people open |

### Build authority

| Skill | What it does |
|---|---|
| `social-content` | Writes posts from your own best posts, not generic hooks |
| `long-form-article` | Plans and drafts a long guide with real numbers and named sources |
| `content-atomizer` | Turns one piece into native posts for every platform |

### Win clients (agencies and freelancers)

| Skill | What it does |
|---|---|
| `find-local-clients` | Picks a trade and a town, then ranks the businesses losing the most customers |
| `pitch-the-fix` | Finds the owner and writes a short email about one thing that's broken, with a fix you can sell |

Say "new client acme.com" to `/maven:cmo` and Maven sets up a separate folder for that
client. "Agency status" shows every client in one table; "brief all clients" writes the
Monday rollup.

## Talk to it in plain words

| You say | Maven does |
|---|---|
| "set up my business", a URL | Reads the business in about 3 minutes and names the first move |
| "deep" | Runs four research agents in parallel for the full foundation (about 15 minutes) |
| "write my 90-day plan", "where should my budget go" | `/marketing-plan` |
| "what should I do this week" | `/weekly-brief` |
| "review my site", "what should I fix first" | A site review with the top 3 fixes |
| "we keep missing calls" | `/speed-to-lead` |
| "not in the map pack" | `/google-business-profile` |
| "are my ads working" | `/ads-incrementality-check` |
| "new client acme.com", "switch to acme", "agency status" | Agency mode |
| "client report for acme" | `/client-report` |
| "remember that we never discount" | Saved to `preferences.md`; every skill obeys it |
| "schedule it" | Sets up the matching routine: drafts and reports only |

## Routines

Recipes in `automations/routines/`, each run through `/schedule` in Claude Code or cron.
All write dated drafts and reports; none publish, send or spend.

| Routine | When |
|---|---|
| Weekly CMO brief | Every Monday |
| Weekly competitor watch | Every Monday |
| Weekly content ritual | Weekly |
| Monthly local checkup (profile, reviews, first screen, missed calls) | First Tuesday |
| Monthly performance review | The 2nd |
| Monthly client report (agency) | The 3rd |
| AI citation monitor | Monthly |
| Brand health check | Quarterly |

Two workflows in `automations/workflows/` build a whole funnel or fan one campaign out
across channels, in parallel, behind the QA gate.

## Tools

Every skill works with your agent's own web search and fetch plus files you give it
(exports, call logs, screenshots). Keys make research deeper and let skills act. Say
"what should I add" and Maven names the one key that would help most for your goal.
Costs, keys and sign-up paths are in [TOOLS.md](TOOLS.md). How it all fits together is in
[SYSTEM-GUIDE.md](SYSTEM-GUIDE.md).

## Ground rules

- Drafts, never actions. Nothing is published, sent, scheduled or spent without you.
- No invented numbers. Every figure is measured, sourced, or marked as an estimate.
- No channel gets credit your own count doesn't support.
- Your files stay in your project folder. Updates never touch them.

## Before you publish this repo

The plugin and marketplace manifests use the placeholder GitHub path `maven-cmo/maven`.
If your repo lives elsewhere, replace `maven-cmo/maven` across the repo (manifests,
README, SYSTEM-GUIDE, schemas), then run the checks:

```bash
bash _system/scripts/doctor.sh
python3 -m unittest discover -s tests
bash _system/scripts/check_banned.sh .
claude plugin validate .claude-plugin/plugin.json
```

## Credits and license

MIT. Maven is built on an MIT-licensed open-source marketing skills library; see
[CREDITS.md](CREDITS.md) for the original work and what Maven changed.

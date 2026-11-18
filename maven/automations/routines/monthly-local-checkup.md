# Routine: monthly local checkup

**Invokes:** `/google-business-profile` (audit), `/reviews` (pace), `/first-screen-check` (one page), `/speed-to-lead` (only if a call log is in the workspace). All non-interactive.
**Cadence:** The first Tuesday of each month at 08:00.

## What it does

The four things that decide whether a local business gets the call, checked against the
top 3 in its map pack once a month: the Google profile, the review pace and replies, the
first screen of the main page on a phone, and missed calls when a log exists. It reports
only what changed since last month and the one fix that matters most. No movement is a
valid short result.

## The /schedule prompt

Run `/schedule` in your marketing workspace and paste:

```
Schedule: the first Tuesday of every month at 08:00 (my timezone).

Task: Run a local checkup for the active brand with zero questions, using the public web
only. 1) /google-business-profile audit mode against the top 3 for the brand's main
"<trade> <town>" search: categories, photos, posts, hours, Q&A, and what changed since
the last checkup. 2) /reviews: rating, count and the last 30 days' pace vs the top 3,
unanswered reviews, and draft replies for any unanswered ones (drafts only). 3)
/first-screen-check on the homepage on a phone: number, promise and proof on the first
screen. 4) Only if a call log or call-tracking export exists in ./campaigns/ or ./data/,
/speed-to-lead missed-call share for the month. Write
./campaigns/local-checkup/<YYYY-MM>.md: what changed, where the business stands vs the
top 3 (as seen, dated), and the one fix that matters most with its skill. Version
competitors.md before refreshing its Watch baseline lines for the top 3. Append one line
to ./brand/assets.md. Never post, reply, publish, send or spend; replies stay drafts.
```

## Every client (agency)

Same prompt with this first line instead: `For each client directory under ./brands/ that has a brand.yaml and a city in its brand block, set that client as active for the run and do the following, writing into that client's own folders; finish with one rollup line per client.`

## Local cron

```cron
0 8 1-7 * 2 cd /path/to/workspace && claude -p "Run the monthly local checkup for the active brand as described in automations/routines/monthly-local-checkup.md: zero questions, public web only, drafts only, write ./campaigns/local-checkup/<YYYY-MM>.md and an assets row." --allowedTools "Read,Write,WebFetch,WebSearch"
```

Note: standard cron treats day-of-month and day-of-week as OR, so this line fires on
days 1-7 and on every Tuesday. Wrap the command in `[ "$(date +\%u)" = 2 ] &&` or use
the /schedule prompt, which understands "first Tuesday".

## Cloud caveat

A cloud routine runs in a fresh clone of your repo: it sees skills committed to that repo
(`.claude/skills/`), not plugin installs on your machine. For cloud runs, commit the
skills folder into the workspace repo first.

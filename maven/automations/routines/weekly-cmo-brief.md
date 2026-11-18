# Routine: weekly CMO brief

**Invokes:** `/weekly-brief` (non-interactive: zero questions).
**Cadence:** Every Monday at 07:30, after the weekly competitor watch, so the brief can use what it found.

## What it does

Turns the 90-day plan into this week's three moves. It reads `plan.md`, last week's rows
in `assets.md`, the newest routine reports and any read-only numbers the keys allow,
then writes a two-minute memo: scoreboard against the plan's pace, what shipped, what is
waiting on the owner, three moves with skills and time, one thing to stop, and the
decisions only the owner can make. Without a plan it still briefs, and its first move is
setting the number.

## The /schedule prompt

Run `/schedule` in your marketing workspace and paste:

```
Schedule: every Monday at 07:30 (my timezone).

Task: Run /weekly-brief in BRIEF mode as defined by skills/weekly-brief/SKILL.md. This is
non-interactive: ask zero questions. Read the active brand's plan.md, assets.md (last 7
days and unfinished campaign work), learnings.md and the newest reports under
./campaigns/ (competitor-watch, ai-search, local-checkup, performance). Use read-only
analytics or Search Console pulls only if keys are configured. Write
./campaigns/briefs/brief-<YYYY-MM-DD>.md with the scoreboard (every number sourced),
shipped, waiting on the owner, three moves with skill and time, one thing to stop, at
most three owner decisions, and proposed learnings only if they carry n= and source:.
Append one line to ./brand/assets.md. Never write learnings.md. Never publish, send,
schedule, deploy or spend.
```

## Every client (agency)

Use the ROLLUP mode instead: `Run /weekly-brief in ROLLUP mode: for each client
directory under ./brands/ with a brand.yaml, one at a time, write that client's brief in
its own folder, then write ./campaigns/briefs/rollup-<YYYY-MM-DD>.md with one row per
client and the client most at risk. Restore ./brands/active to its starting value at the
end.`

## Local cron

```cron
30 7 * * 1 cd /path/to/workspace && claude -p "Run /weekly-brief in BRIEF mode with zero questions, write this week's brief under ./campaigns/briefs/, add an assets row, never write learnings.md and never publish, send or spend." --allowedTools "Read,Write,Glob,Grep"
```

## Cloud caveat

A cloud routine runs in a fresh clone of your repo: it sees skills committed to that repo
(`.claude/skills/`), not plugin installs on your machine. For cloud runs, commit the
skills folder into the workspace repo first.

# Routine: monthly client report (agency)

**Invokes:** `/client-report` for each client (non-interactive: zero questions).
**Cadence:** The 3rd of each month at 09:00, after the monthly performance review on the 2nd.

## What it does

Drafts every client's monthly report from the numbers already in the workspace: the
client's count for the month (call log, booking or CRM export the team dropped into the
client's folder), the platform exports, `plan.md`, the month's `assets.md` rows and the
performance review. A client with no count for the month gets a one-paragraph draft
that says which export is missing, rather than a report built on platform claims. The
agency reviews and sends each one.

## The /schedule prompt

Run `/schedule` in your agency workspace and paste:

```
Schedule: the 3rd of every month at 09:00 (my timezone).

Task: For each client directory under ./brands/ that has a brand.yaml, one at a time,
set that client as active and run /client-report for the previous month as defined in
skills/client-report/SKILL.md, with zero questions. Use only files in that client's
folder and its ./campaigns/ (exports, call logs, the performance review, plan.md,
assets.md). Write ./campaigns/reports/<YYYY-MM>-report.md and <YYYY-MM>-notes.md in that
client's space, with every number sourced and no channel credited beyond the client's
own count. If the month's count is missing, write a short draft naming the export needed
and move on. Append one assets.md line per client. Restore ./brands/active to its
starting value. Finish with one rollup line per client: drafted, or missing what. Never
send anything.
```

## Local cron

```cron
0 9 3 * * cd /path/to/workspace && claude -p "Draft last month's /client-report for every client under ./brands/ as described in automations/routines/monthly-client-report.md: zero questions, sourced numbers only, drafts only, restore the active client at the end." --allowedTools "Read,Write,Glob,Grep"
```

## Cloud caveat

A cloud routine runs in a fresh clone of your repo: it sees skills committed to that repo
(`.claude/skills/`), not plugin installs on your machine. For cloud runs, commit the
skills folder into the workspace repo first. Client exports often hold customer phone
numbers; keep them out of any shared repo and run this one locally if so.

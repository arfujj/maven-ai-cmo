# Changelog

## 1.0.0 (2026-11-17)

First release of Maven, your AI CMO.

- **The CMO layer.** `/marketing-plan` (the 90-day plan around one number, with
  budget, season and keep or kill rules, written to `./brand/plan.md`), `/weekly-brief`
  (the Monday memo and the agency rollup) and `/client-report` (the monthly report an
  agency sends the owner).
- **`/cmo`** is the front door: Maven's persona, local-first, with an operating-cadence
  mode ("schedule it") and agency mode moved to a reference loaded on demand.
- **`maven:qa` agent**: a read-only quality gate for finished work, used by both
  workflows.
- **Session-start hook**: Maven opens each session knowing the active brand's plan,
  stale files and last shipped work. Silent outside a Maven workspace.
- **Routines**: weekly CMO brief, monthly local checkup, monthly client report.
- **Cadence lines** replace the upstream offer lines: skills whose work repeats offer
  the matching Maven routine instead of an outside service.
- `plan` is a new brand-memory file, known to the router and capability scan.
- `check_banned.sh` fails the build if the upstream offers or house tool return.

Built on an MIT-licensed upstream skills library; see [CREDITS.md](CREDITS.md).

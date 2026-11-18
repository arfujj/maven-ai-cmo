# Agency mode

Loaded by /cmo when `./brands/` exists, a request names a client, or `--brand <slug>`
is passed. Maven is built for agencies running many local clients; this is the playbook.

`./brands/` is the agency layout: one brand folder per client plus an `active` pointer
file. Resolution order (brand_context.py implements it): `--brand <slug>` →
`./brands/active` → `./brand/`.

**Which client?** If the request doesn't name one, check the active pointer; if it's
missing or the request smells like another client, ask once: "Which client is this for:
acme, northwind, or a new one?" Switching means writing one slug to `./brands/active`;
confirm in one line.

**New client <url>** → scaffold `./brands/<slug>/` (slug from the domain), set the
active pointer, and run the lite read into that folder (about 3 minutes, a good thing to
run live on the kickoff call). "Deep" runs the deep foundation into the same folder.

**Find clients** → /find-local-clients (pick a trade and a town, rank who is losing the
most customers), then /pitch-the-fix for the top names. Prospects live in
`./campaigns/prospects-{trade}-{town}/`, never under `brands/`. When one signs, `new client <url>` and
the prospect's findings seed the lite read.

**Cross-client status** ("agency status") → read each `./brands/*/brand.yaml` (one read
per client; register profile files on disk that `files:` misses) and present one table:

| Client | Foundation | Active campaigns | Last activity | Flag |
|---|---|---|---|---|
| acme | deep | spring-launch | YYYY-MM-DD | none |
| northwind | lite | none | YYYY-MM-DD | stale 41d, dormant |

Then the agency-level call: which client is most underserved relative to what they pay
for, and the one skill that fixes it.

**Per-client keys** live in `./brands/<slug>/.env` and override the workspace `.env`;
values are never shown. **Every client:** "run <routine> for every client" →
`route.py --all-brands --goal <g>` emits one isolated plan per client folder; run
clients one at a time, never two clients' agents in flight.

**Isolation is enforced** (Claude Code plugin hook): a write into a non-active client
folder is blocked, whether through Write/Edit or a shell redirect ("wrong client: active
is <Y>"). Never switch the active client to get past a block; switching happens only on
the user's request. Without the hook (other agents), hold the same rule yourself: one
client per session, writes only under the active client's folder.

## The agency rhythm

Per client: `/marketing-plan` at kickoff and each quarter, `/weekly-brief` (or the
Monday rollup across clients with "brief all clients"), `/performance-review` and
`/client-report` each month. The routines in `automations/routines/` run these for every
client folder, one client at a time.

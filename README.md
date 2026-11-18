# Maven: your AI CMO

Maven reads a local business (its website, a real phone render, its Google profile, reviews and the
competitors that rank above it), scores six stages from search to repeat customer, and hands back the
fixes that matter, a 90-day plan, drafts to approve and 26 tools that do the work.

| Folder | What it is |
|---|---|
| [`app/`](app) | The SaaS: Next.js 15 + Supabase + Claude (via OpenRouter). Landing page, live analysis, reports, Toolkit, Find clients, Ask Maven, billing. See [app/README.md](app/README.md). |
| [`maven/`](maven) | The Claude Code plugin: 35 marketing skills, agents, hooks and routines that power the app's Toolkit. See [maven/README.md](maven/README.md). |
| [`website/`](website) | A standalone static landing page for the plugin. |

## Quick start (app)

```bash
cd app
cp .env.example .env.local   # add your keys
npm install
npm run dev                  # http://localhost:3100
```

Maven is built on an MIT-licensed open-source skills library; see [maven/CREDITS.md](maven/CREDITS.md).

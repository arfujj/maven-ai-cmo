// Copy the Maven skill instructions (SKILL.md + references/*.md) into ./skills so they ship with the app.
// Run after changing ../maven/skills:  node scripts/sync-skills.mjs
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const src = join(process.cwd(), "..", "maven", "skills");
const dest = join(process.cwd(), "skills");
if (!existsSync(src)) throw new Error(`No skills found at ${src}`);
rmSync(dest, { recursive: true, force: true });
let n = 0;
for (const skill of readdirSync(src)) {
  const from = join(src, skill);
  if (!existsSync(join(from, "SKILL.md"))) continue;
  mkdirSync(join(dest, skill, "references"), { recursive: true });
  cpSync(join(from, "SKILL.md"), join(dest, skill, "SKILL.md"));
  const refs = join(from, "references");
  if (existsSync(refs)) for (const f of readdirSync(refs)) if (f.endsWith(".md")) cpSync(join(refs, f), join(dest, skill, "references", f));
  n++;
}
console.log(`Synced ${n} skills into ./skills`);

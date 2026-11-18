#!/usr/bin/env python3
"""SessionStart hook: a short brand status so Maven starts every session knowing the state.

Prints nothing unless the workspace holds Maven brand memory (./brand/ or ./brands/).
Never prints file contents beyond one line of the plan's number, never prints keys, and
always exits 0 so a hook problem can never block a session. Python 3 stdlib only.
"""
import datetime
import json
import os
import re
import sys
from pathlib import Path

PROFILE_FILES = ["voice-profile.md", "positioning.md", "audience.md", "voc.md", "competitors.md", "plan.md"]
STALE_DAYS = 30


def brand_field(text, key):
    m = re.search(rf"^\s+{key}:\s*(.+?)\s*$", text, re.M)
    return m.group(1).strip().strip("'\"") if m else ""


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        data = {}
    root = Path(data.get("cwd") or os.getcwd())
    brands, single = root / "brands", root / "brand"
    clients = sorted(p.name for p in brands.iterdir() if (p / "brand.yaml").is_file()) if brands.is_dir() else []
    slug = ""
    active = brands / "active"
    if active.is_file():
        slug = active.read_text(encoding="utf-8").strip()
    brand_dir = brands / slug if slug and (brands / slug).is_dir() else single
    if not brand_dir.is_dir() and not clients:
        return

    today = datetime.date.today()
    lines = ["Maven (AI CMO) workspace status, from the session-start hook:"]
    if clients:
        lines.append(f"- Agency layout: {len(clients)} client(s) ({', '.join(clients[:8])}"
                     f"{', ...' if len(clients) > 8 else ''}); active: {slug or 'none set'}.")
    if brand_dir.is_dir():
        manifest = brand_dir / "brand.yaml"
        text = manifest.read_text(encoding="utf-8") if manifest.is_file() else ""
        name = brand_field(text, "name") or brand_dir.name
        depth = brand_field(text, "depth") or "unknown"
        city = brand_field(text, "city")
        lines.append(f"- Brand: {name}{' (' + city + ')' if city else ''}, foundation depth: {depth}.")

        plan = brand_dir / "plan.md"
        if plan.is_file():
            ptext = plan.read_text(encoding="utf-8")
            m = re.search(r"^## The number\s*\n+(.+)$", ptext, re.M)
            lines.append(f"- 90-day plan: {m.group(1).strip()[:160] if m else 'present'}.")
        else:
            lines.append("- No 90-day plan yet (/marketing-plan sets the number).")

        stale = []
        for f in PROFILE_FILES:
            p = brand_dir / f
            if p.is_file():
                age = (today - datetime.date.fromtimestamp(p.stat().st_mtime)).days
                if age > STALE_DAYS:
                    stale.append(f"{f} {age}d")
        if stale:
            lines.append(f"- Over {STALE_DAYS} days old: {', '.join(stale)}.")

        assets = brand_dir / "assets.md"
        if assets.is_file():
            dates = re.findall(r"^- \[(\d{4}-\d{2}-\d{2})\]", assets.read_text(encoding="utf-8"), re.M)
            if dates:
                lines.append(f"- Last shipped asset: {max(dates)}.")

    briefs = sorted((root / "campaigns" / "briefs").glob("brief-*.md")) if (root / "campaigns" / "briefs").is_dir() else []
    if briefs:
        lines.append(f"- Last weekly brief: {briefs[-1].stem.replace('brief-', '')}.")
    lines.append("Use this only when it changes the advice; do not recite it. Front door: /cmo.")
    print("\n".join(lines))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
    sys.exit(0)

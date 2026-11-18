#!/usr/bin/env bash
# check_banned.sh [dir] — fail if internal, private or vendor terms appear in the tree.
#   1. internal names and the private measurement path (anywhere)
#   2. privacy terms: client names, author paths, ad account IDs, conversion labels (anywhere)
#   3. the upstream library's brand, offers and house tool, outside the attribution files
#      (LICENSE, CREDITS.md, and README lines that point at CREDITS.md)
set -uo pipefail
ROOT="${1:-.}"
EXCL=(--exclude-dir=.git --exclude-dir=internal --exclude-dir=node_modules --exclude-dir=__pycache__ --exclude-dir=.pytest_cache --exclude-dir=outputs --exclude-dir=results --exclude=PROVENANCE.md --exclude=check_banned.sh)
FAIL=0

PAT='brain_|hermes|HERMES-INTEGRATION|BRAIN_API_KEY|BM_API_KEY|boring_marketing|llm_mentions|brightdata|coming soon|[-]{2}James'
if grep -rniE "${EXCL[@]}" "$PAT" "$ROOT"; then echo "BANNED TERMS FOUND"; FAIL=1; fi

# Privacy terms. Real client and author names live outside the published tree, in
# internal/privacy-terms.env (gitignored), which sets PRIV_I (case-insensitive) and PRIV_S
# (case-sensitive). Without that file only author paths are checked.
PRIV_I='/Users/'
PRIV_S='a^'
TERMS="${PRIVACY_TERMS_FILE:-$(cd "$(dirname "$0")/../.." && pwd)/internal/privacy-terms.env}"
[[ -f "$TERMS" ]] && source "$TERMS"
if grep -rniE "${EXCL[@]}" "$PRIV_I" "$ROOT" || grep -rnE "${EXCL[@]}" "$PRIV_S" "$ROOT"; then
  echo "PRIVATE NAME, PATH OR ID FOUND"; FAIL=1
fi
# Ad account IDs (act_) and Google Ads conversion IDs (AW-). Placeholders must look fake:
# act_<id>, act_123, act_1234567890 (a 1-2-3 run) or zeros pass; any other digits fail.
IDS="$(grep -rnoE "${EXCL[@]}" '(act_|AW-)[0-9]+' "$ROOT" | grep -vE ':(act_|AW-)(1234567890|123456789|12345678|1234567|123456|12345|1234|123|0+)$')"
if [[ -n "$IDS" ]]; then
  echo "$IDS"; echo "REAL-LOOKING AD ACCOUNT OR CONVERSION ID FOUND (use act_<id>, act_123 or AW-123456789 as placeholders)"; FAIL=1
fi

# Maven is built on an MIT-licensed upstream library. Its name, offers and house tool may
# appear only in the attribution: LICENSE, CREDITS.md, and README lines that link CREDITS.md.
UP='boring[ -]?marketing|boringmarketer|boringfunnels|skool\.com|vibe-?marketers|thevibemarketer'
UPSTREAM="$(grep -rniE "${EXCL[@]}" --exclude=LICENSE --exclude=CREDITS.md "$UP" "$ROOT" \
  | grep -vE '(^|/)README\.md:[0-9]+:.*CREDITS\.md')"
if [[ -n "$UPSTREAM" ]]; then
  echo "$UPSTREAM"
  echo "UPSTREAM BRAND OR OFFER FOUND OUTSIDE THE ATTRIBUTION (LICENSE, CREDITS.md)"
  FAIL=1
fi

[[ $FAIL -eq 0 ]] && echo "banned-terms OK"
exit $FAIL

#!/bin/bash
# Run a harness check from a local mirror outside iCloud.
# The repo lives on the iCloud-synced Desktop, which evicts files (node_modules, even assets/*.js) to
# placeholders that make Node block forever. This copies the tree to a temp dir and runs Node there.
# usage: tools/harness/hx.sh run <module.html> [rounds] [typeFilter]
#        tools/harness/hx.sh lint <module.html>
#        tools/harness/hx.sh gauntlet <page.html>
#        tools/harness/hx.sh deck
# Works from any worktree: it mirrors the tree that contains this script.
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TMP="${TMPDIR:-/tmp}"; TMP="${TMP%/}"
CACHE="$TMP/study-modules-harness"
if [ ! -f "$CACHE/node_modules/jsdom/package.json" ] || ! cmp -s "$ROOT/tools/harness/package-lock.json" "$CACHE/package-lock.json"; then
  mkdir -p "$CACHE" && cp "$ROOT/tools/harness/package.json" "$ROOT/tools/harness/package-lock.json" "$CACHE/" && (cd "$CACHE" && npm ci --silent) || exit 1
fi
DST="$(mktemp -d "$TMP/study-modules-mirror.XXXXXX")"; trap 'rm -rf "$DST"' EXIT
rsync -a --exclude node_modules --exclude .git --exclude .claude --exclude 'tools/chat-*' "$ROOT/" "$DST/" || exit 1
ln -sfn "$CACHE/node_modules" "$DST/tools/harness/node_modules"
cd "$DST" || exit 1
MODE="$1"; shift
case "$MODE" in
  run)      perl -e 'alarm 400; exec @ARGV' node tools/harness/run.js "$@" ;;
  lint)     node tools/harness/lint.js "$@" ;;
  gauntlet) perl -e 'alarm 400; exec @ARGV' node tools/harness/gauntletcheck.js "$@" ;;
  deck)     perl -e 'alarm 400; exec @ARGV' node tools/harness/deckcheck.js "$@" ;;
  *) echo "usage: tools/harness/hx.sh run|lint|gauntlet <file.html> [args], or deck"; exit 2 ;;
esac

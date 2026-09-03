#!/bin/bash
# PreToolUse hook — injects relevant rule(s) when Claude edits/writes a known path.
# Output JSON via additionalContext so Claude sees the rule before producing the edit.
# Keeps rules out of the always-on context; only path-matched rules are loaded.
#
# Portable: REPO_ROOT is derived from this script's own location, so it works on any
# machine and from any clone path (no hardcoded absolute paths).

set -e

input=$(cat)
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$file_path" ] && exit 0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"   # .claude/hooks -> repo root
RULES_DIR="$REPO_ROOT/.claude/docs/rules"

rules=()

# React components (client or server) — TSX gets the UI/React/design rules.
case "$file_path" in
  *.tsx) rules+=(react.md ui.md responsive.md) ;;
esac

# App Router pages / layouts / route handlers
case "$file_path" in
  */src/app/*/page.tsx|*/src/app/page.tsx|*/src/app/*/layout.tsx|*/src/app/layout.tsx)
    rules+=(architecture.md reactivity-loading.md) ;;
  */src/app/api/*/route.ts|*/src/app/api/*/route.tsx)
    rules+=(services.md architecture.md auth.md) ;;
esac

# Server actions (the data/mutation layer)
case "$file_path" in
  */src/actions/*|*/src/app/actions/*)
    rules+=(services.md state-management.md architecture.md) ;;
esac

# Data-access / lib helpers (prisma, session, mail, etc.)
case "$file_path" in
  */src/lib/*) rules+=(architecture.md) ;;
esac

# Client hooks
case "$file_path" in
  */src/hooks/*) rules+=(hooks.md react.md) ;;
esac

# Auth surface (session, middleware, login/registro, admin)
case "$file_path" in
  *session*|*middleware*|*/login/*|*/registro/*|*/admin/*|*auth*|*recuperar-contrasena*)
    rules+=(auth.md) ;;
esac

# Prisma schema
case "$file_path" in
  *prisma/schema.prisma) rules+=(services.md) ;;
esac

# Tests
case "$file_path" in
  *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx) rules+=(tests.md) ;;
esac

[ ${#rules[@]} -eq 0 ] && exit 0

# Dedupe preserving order
uniq_rules=($(printf '%s\n' "${rules[@]}" | awk '!seen[$0]++'))

ctx=""
for r in "${uniq_rules[@]}"; do
  f="$RULES_DIR/$r"
  if [ -f "$f" ]; then
    ctx="${ctx}

=== Project rule: $r ===
$(cat "$f")"
  fi
done

[ -z "$ctx" ] && exit 0

header="Path-matched project rules auto-injected. Apply these when producing the edit. Do NOT load additional rules unless the task spans new areas."
final="${header}${ctx}"

jq -nc --arg c "$final" '{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:$c}}'

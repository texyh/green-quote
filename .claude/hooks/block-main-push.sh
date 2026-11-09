#!/bin/bash
# Blocks `git push` to main: explicit target (`git push origin main`, `HEAD:main`) or a bare push while on main.
input=$(cat)
cmd=$(jq -r '.tool_input.command // ""' <<<"$input")
dir=$(jq -r '.cwd // "."' <<<"$input")

echo "$cmd" | grep -qE '(^|[;&| ])git( -C [^ ]+)? push' || exit 0

push_args=$(echo "$cmd" | sed -E 's/.*git( -C [^ ]+)? push//; s/[;&|].*//')

if echo " $push_args " | grep -qE '([ :]|refs/heads/)main '; then
  echo "Blocked: don't push directly to main. Push a feature branch and open a PR." >&2
  exit 2
fi

branch=$(git -C "$dir" branch --show-current 2>/dev/null)
args=$(echo "$push_args" | tr ' ' '\n' | grep -cvE '^(-.*)?$')
if [ "$branch" = "main" ] && [ "${args:-0}" -lt 2 ]; then
  echo "Blocked: you're on main and this push would target it. Create a branch first." >&2
  exit 2
fi
exit 0

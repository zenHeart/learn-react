#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
[ -z "$(git status --porcelain)" ] || { echo 'Refusing to deploy an uncommitted checkout' >&2; exit 1; }
[ "$(git branch --show-current)" = master ] || { echo 'Deploy from master after integration' >&2; exit 1; }
git fetch origin master --quiet
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/master)" ] || { echo 'Local master must match pushed origin/master' >&2; exit 1; }
# The CLI uses its existing credential chain. No token arguments, Git URL or shell tracing.
gh workflow run deploy.yml --repo zenHeart/learn-react --ref master
printf '%s\n' 'Workflow dispatched. Verify the run, version.json and HTTPS before reporting success.'

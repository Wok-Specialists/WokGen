#!/usr/bin/env bash
# WokGen smoke test — runs against BASE_URL (default: http://localhost:3000)
# Usage: BASE_URL=https://yourapp.com bash scripts/smoke-test.sh

set -euo pipefail

BASE="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0
ERRORS=()

check() {
  local label="$1"
  local url="$2"
  local expected_status="${3:-200}"
  local method="${4:-GET}"

  status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
    -H "User-Agent: WokGen-Smoke/1.0" \
    --max-time 10 \
    "$url")

  if [ "$status" = "$expected_status" ]; then
    echo "  PASS  $label ($status)"
    ((PASS++))
  else
    echo "  FAIL  $label — expected $expected_status got $status"
    ((FAIL++))
    ERRORS+=("$label: expected $expected_status, got $status")
  fi
}

echo "WokGen Smoke Test → $BASE"
echo "---"

check "Health check"                    "$BASE/api/health"
check "OpenAPI spec"                    "$BASE/api/openapi"
check "Home page"                       "$BASE/"
check "Gallery page"                    "$BASE/gallery"
check "Pixel studio"                    "$BASE/pixel/studio"
check "Changelog"                       "$BASE/changelog"
check "Docs home"                       "$BASE/docs"
check "API docs"                        "$BASE/docs/platform/api"
check "Auth page"                       "$BASE/api/auth/signin"
check "404 page"                        "$BASE/this-page-does-not-exist-smoke" "404"
check "Generate requires auth"          "$BASE/api/generate" "401" "POST"
check "Gallery search"                  "$BASE/api/gallery?limit=5"
check "Metrics endpoint"               "$BASE/api/metrics"
check "Rate limit (unauthenticated)"   "$BASE/api/generate" "401" "GET"

echo "---"
echo "Results: $PASS passed, $FAIL failed"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "Failures:"
  for e in "${ERRORS[@]}"; do
    echo "  - $e"
  done
  exit 1
fi

exit 0

#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${MAP_TEST_DB_URL:-}" ]]; then
  echo "MAP_TEST_DB_URL is required" >&2
  exit 1
fi

request_sql="select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false); set role authenticated; select public.reserve_map_session('web')->>'allowed';"

results="$({
  seq 1 40 | xargs -P 16 -I '{}' psql "${MAP_TEST_DB_URL}" -v ON_ERROR_STOP=1 -Atqc "${request_sql}"
} | sort)"

allowed_count="$(printf '%s\n' "${results}" | awk '$0 == "true" { count += 1 } END { print count + 0 }')"
blocked_count="$(printf '%s\n' "${results}" | awk '$0 == "false" { count += 1 } END { print count + 0 }')"
stored_count="$(psql "${MAP_TEST_DB_URL}" -v ON_ERROR_STOP=1 -Atqc 'select web_sessions from public.map_usage_cycles')"

if [[ "${allowed_count}" != "25" || "${blocked_count}" != "15" || "${stored_count}" != "25" ]]; then
  echo "Atomic budget failure: allowed=${allowed_count}, blocked=${blocked_count}, stored=${stored_count}" >&2
  exit 1
fi

echo "Atomic budget passed: 25 allowed, 15 blocked, 25 stored"

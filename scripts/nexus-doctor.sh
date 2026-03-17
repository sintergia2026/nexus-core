#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="${1:-$(pwd)}"

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

pass() {
  echo "[PASS] $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

warn() {
  echo "[WARN] $1"
  WARN_COUNT=$((WARN_COUNT + 1))
}

fail() {
  echo "[FAIL] $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

check_dir() {
  local path="$1"
  if [ -d "$ROOT_DIR/$path" ]; then
    pass "directory exists: $path"
  else
    fail "missing directory: $path"
  fi
}

check_file() {
  local path="$1"
  if [ -f "$ROOT_DIR/$path" ]; then
    pass "file exists: $path"
  else
    fail "missing file: $path"
  fi
}

check_nonempty_file() {
  local path="$1"
  if [ ! -f "$ROOT_DIR/$path" ]; then
    fail "missing file: $path"
    return
  fi

  if [ -s "$ROOT_DIR/$path" ]; then
    pass "non-empty file: $path"
  else
    warn "empty file: $path"
  fi
}

echo "--------------------------------------------------"
echo "NEXUS DOCTOR"
echo "Repository: $ROOT_DIR"
echo "--------------------------------------------------"

# Core directories
CORE_DIRS=(
  "00_registry"
  "01_docs"
  "02_contracts"
  "03_ontology"
  "04_twin"
  "05_engine"
  "06_data"
  "07_app"
  "08_agents"
  "09_governance"
  "10_examples"
  "11_tests"
  "12_sectors"
  "scripts"
  "bin"
)

for dir in "${CORE_DIRS[@]}"; do
  check_dir "$dir"
done

# Root files
ROOT_FILES=(
  ".env.example"
  ".gitignore"
  "package.json"
  "README.md"
  "tsconfig.json"
  "turbo.json"
  "bin/nexus"
  "scripts/nexus-init.sh"
)

for file in "${ROOT_FILES[@]}"; do
  check_file "$file"
done

# Critical non-empty docs
CRITICAL_DOCS=(
  "01_docs/ARCHITECTURE_PRINCIPLES.md"
  "01_docs/CANONICAL_SYSTEM_FLOW.md"
  "01_docs/DOMAIN_MODEL_OVERVIEW.md"
  "01_docs/REPO_GOVERNANCE.md"
  "README.md"
  "package.json"
  "tsconfig.json"
)

for file in "${CRITICAL_DOCS[@]}"; do
  check_nonempty_file "$file"
done

# Critical engines
CRITICAL_TS=(
  "03_ontology/registry/ontology_registry.ts"
  "04_twin/twin_builder/build_twin.ts"
  "04_twin/twin_builder/validate_twin.ts"
  "05_engine/orchestration/engine_orchestrator.ts"
  "05_engine/reporting/reporting_orchestrator.ts"
  "05_engine/diagnostics/diagnostic_engine.ts"
  "05_engine/scoring/governance/governance_score_engine.ts"
  "08_agents/orchestration/agent_registry.ts"
  "08_agents/orchestration/agent_supervisor.ts"
)

for file in "${CRITICAL_TS[@]}"; do
  check_nonempty_file "$file"
done

# Sector directories
SECTORS=(
  "restaurants"
  "retail"
  "services"
  "healthcare"
  "construction"
  "education"
  "technology"
  "logistics"
  "general_ops"
)

for sector in "${SECTORS[@]}"; do
  check_dir "12_sectors/$sector"
done

echo "--------------------------------------------------"
echo "DOCTOR SUMMARY"
echo "PASS: $PASS_COUNT"
echo "WARN: $WARN_COUNT"
echo "FAIL: $FAIL_COUNT"
echo "--------------------------------------------------"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "STATUS: UNHEALTHY"
  exit 1
fi

if [ "$WARN_COUNT" -gt 0 ]; then
  echo "STATUS: PARTIAL / REQUIRES HARDENING"
  exit 0
fi

echo "STATUS: HEALTHY BASELINE"

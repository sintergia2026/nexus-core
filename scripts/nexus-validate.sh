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

validate_json_file() {
  local file="$1"

  if [ ! -f "$ROOT_DIR/$file" ]; then
    fail "missing json file: $file"
    return
  fi

  if python3 -m json.tool "$ROOT_DIR/$file" >/dev/null 2>&1; then
    pass "valid json: $file"
  else
    fail "invalid json: $file"
  fi
}

check_ts_contains_export() {
  local file="$1"

  if [ ! -f "$ROOT_DIR/$file" ]; then
    fail "missing ts file: $file"
    return
  fi

  if grep -Eq "export[[:space:]]+(const|type|interface|class|function)" "$ROOT_DIR/$file"; then
    pass "ts export detected: $file"
  else
    warn "ts file has no export signature: $file"
  fi
}

check_path_exists() {
  local path="$1"
  if [ -e "$ROOT_DIR/$path" ]; then
    pass "exists: $path"
  else
    fail "missing: $path"
  fi
}

echo "--------------------------------------------------"
echo "NEXUS VALIDATE"
echo "Repository: $ROOT_DIR"
echo "--------------------------------------------------"

# Validate registries
REGISTRY_JSON=(
  "00_registry/module_registry.json"
  "00_registry/system_ids.json"
  "00_registry/twin_registry.json"
  "00_registry/contract_registry.json"
  "00_registry/engine_registry.json"
  "00_registry/report_registry.json"
  "00_registry/ai_governance_registry.json"
  "00_registry/governance_score_registry.json"
  "00_registry/maturity_level_registry.json"
  "00_registry/badge_registry.json"
  "00_registry/sector_registry.json"
)

for file in "${REGISTRY_JSON[@]}"; do
  validate_json_file "$file"
done

# Validate contracts
CONTRACT_JSON=(
  "02_contracts/decision_labels.json"
  "02_contracts/diagnostic_types.json"
  "02_contracts/entity_types.json"
  "02_contracts/event_types.json"
  "02_contracts/metric_types.json"
  "02_contracts/relationship_types.json"
  "02_contracts/risk_types.json"
  "02_contracts/signal_types.json"
  "02_contracts/snapshot_types.json"
  "02_contracts/state_labels.json"
  "02_contracts/twin_layers.json"
  "02_contracts/twin_state_types.json"
  "02_contracts/constraint_types.json"
  "02_contracts/workflow_types.json"
  "02_contracts/report_types.json"
  "02_contracts/report_sections.json"
  "02_contracts/chart_types.json"
  "02_contracts/delivery_types.json"
  "02_contracts/ai_policy_types.json"
  "02_contracts/ai_agent_types.json"
  "02_contracts/data_capture_types.json"
  "02_contracts/intake_frequencies.json"
  "02_contracts/role_responsibility_types.json"
  "02_contracts/validation_rule_types.json"
  "02_contracts/governance_dimensions.json"
  "02_contracts/governance_score_types.json"
  "02_contracts/maturity_levels.json"
  "02_contracts/badge_types.json"
  "02_contracts/governance_progress_types.json"
  "02_contracts/scoring_weight_types.json"
  "02_contracts/sector_types.json"
  "02_contracts/sector_layers.json"
  "02_contracts/sector_diagnostic_profiles.json"
  "02_contracts/sector_metric_profiles.json"
  "02_contracts/sector_workflow_profiles.json"
  "02_contracts/sector_reporting_profiles.json"
)

for file in "${CONTRACT_JSON[@]}"; do
  validate_json_file "$file"
done

# Validate critical TS exports
TS_EXPORT_FILES=(
  "03_ontology/registry/ontology_registry.ts"
  "03_ontology/types/ontology_types.ts"
  "04_twin/twin_builder/build_twin.ts"
  "04_twin/twin_builder/validate_twin.ts"
  "04_twin/types/twin_types.ts"
  "05_engine/diagnostics/diagnostic_engine.ts"
  "05_engine/scoring/score_engine.ts"
  "05_engine/scoring/governance/governance_score_engine.ts"
  "05_engine/reporting/report_builder.ts"
  "05_engine/reporting/reporting_orchestrator.ts"
  "05_engine/orchestration/engine_orchestrator.ts"
  "05_engine/types/engine_types.ts"
  "08_agents/orchestration/agent_router.ts"
  "08_agents/orchestration/agent_registry.ts"
  "08_agents/orchestration/agent_supervisor.ts"
)

for file in "${TS_EXPORT_FILES[@]}"; do
  check_ts_contains_export "$file"
done

# Validate canonical sectors
SECTOR_FILES=(
  "03_ontology/sectors/restaurants.sector.ts"
  "03_ontology/sectors/retail.sector.ts"
  "03_ontology/sectors/services.sector.ts"
  "03_ontology/sectors/healthcare.sector.ts"
  "03_ontology/sectors/construction.sector.ts"
  "03_ontology/sectors/education.sector.ts"
  "03_ontology/sectors/technology.sector.ts"
  "03_ontology/sectors/logistics.sector.ts"
  "03_ontology/sectors/general_ops.sector.ts"
)

for file in "${SECTOR_FILES[@]}"; do
  check_path_exists "$file"
done

# Validate topological spine
SPINE_PATHS=(
  "02_contracts"
  "03_ontology"
  "04_twin"
  "05_engine"
  "07_app"
  "09_governance"
)

for path in "${SPINE_PATHS[@]}"; do
  check_path_exists "$path"
done

echo "--------------------------------------------------"
echo "VALIDATE SUMMARY"
echo "PASS: $PASS_COUNT"
echo "WARN: $WARN_COUNT"
echo "FAIL: $FAIL_COUNT"
echo "--------------------------------------------------"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "STATUS: INVALID STRUCTURE"
  exit 1
fi

if [ "$WARN_COUNT" -gt 0 ]; then
  echo "STATUS: VALID BUT WEAK"
  exit 0
fi

echo "STATUS: STRUCTURALLY VALID"

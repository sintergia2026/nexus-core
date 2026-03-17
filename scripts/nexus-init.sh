#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="${1:-$(pwd)}"

log() {
  echo "[nexus:init] $1"
}

ensure_dir() {
  local dir="$1"
  if [ ! -d "$ROOT_DIR/$dir" ]; then
    mkdir -p "$ROOT_DIR/$dir"
    log "created dir: $dir"
  else
    log "exists dir:   $dir"
  fi
}

ensure_file() {
  local file="$1"
  if [ ! -f "$ROOT_DIR/$file" ]; then
    mkdir -p "$(dirname "$ROOT_DIR/$file")"
    touch "$ROOT_DIR/$file"
    log "created file: $file"
  else
    log "exists file:  $file"
  fi
}

ensure_json_array_file() {
  local file="$1"
  if [ ! -f "$ROOT_DIR/$file" ]; then
    mkdir -p "$(dirname "$ROOT_DIR/$file")"
    printf '%s\n' '[]' > "$ROOT_DIR/$file"
    log "created json: $file"
  else
    log "exists json:  $file"
  fi
}

ensure_json_object_file() {
  local file="$1"
  if [ ! -f "$ROOT_DIR/$file" ]; then
    mkdir -p "$(dirname "$ROOT_DIR/$file")"
    printf '%s\n' '{}' > "$ROOT_DIR/$file"
    log "created json: $file"
  else
    log "exists json:  $file"
  fi
}

ensure_md_file() {
  local file="$1"
  local title="$2"
  if [ ! -f "$ROOT_DIR/$file" ]; then
    mkdir -p "$(dirname "$ROOT_DIR/$file")"
    cat > "$ROOT_DIR/$file" <<EOF
# $title

Status: draft
Owner: SINTERGIA / NEXUS
Canonical Repository: nexus-core

EOF
    log "created md:    $file"
  else
    log "exists md:     $file"
  fi
}

ensure_ts_file() {
  local file="$1"
  local symbol="$2"
  if [ ! -f "$ROOT_DIR/$file" ]; then
    mkdir -p "$(dirname "$ROOT_DIR/$file")"
    cat > "$ROOT_DIR/$file" <<EOF
export const $symbol = {
  id: "$symbol",
};
EOF
    log "created ts:    $file"
  else
    log "exists ts:     $file"
  fi
}

ensure_sql_file() {
  local file="$1"
  local table="$2"
  if [ ! -f "$ROOT_DIR/$file" ]; then
    mkdir -p "$(dirname "$ROOT_DIR/$file")"
    cat > "$ROOT_DIR/$file" <<EOF
-- $table
-- nexus-core canonical schema placeholder
EOF
    log "created sql:   $file"
  else
    log "exists sql:    $file"
  fi
}

log "initializing nexus-core at: $ROOT_DIR"

# -------------------------------------------------------------------
# ROOT DIRECTORIES
# -------------------------------------------------------------------
DIRS=(
  "00_registry"
  "01_docs"
  "02_contracts"
  "03_ontology/entities"
  "03_ontology/relationships"
  "03_ontology/sectors"
  "03_ontology/states"
  "03_ontology/constraints"
  "03_ontology/signals"
  "03_ontology/workflows"
  "03_ontology/registry"
  "03_ontology/types"
  "04_twin/crcp"
  "04_twin/structural"
  "04_twin/operational"
  "04_twin/behavioral"
  "04_twin/strategic"
  "04_twin/governance"
  "04_twin/snapshots"
  "04_twin/lineage"
  "04_twin/state_models"
  "04_twin/twin_builder"
  "04_twin/types"
  "05_engine/intake/connectors"
  "05_engine/intake/parsers"
  "05_engine/intake/loaders"
  "05_engine/normalization"
  "05_engine/mapping"
  "05_engine/metrics/throughput"
  "05_engine/metrics/utilization"
  "05_engine/metrics/leakage"
  "05_engine/metrics/latency"
  "05_engine/diagnostics/detectors"
  "05_engine/diagnostics/interpreters"
  "05_engine/diagnostics/classifiers"
  "05_engine/scoring/governance"
  "05_engine/simulation/scenarios"
  "05_engine/reporting/weekly"
  "05_engine/reporting/monthly"
  "05_engine/reporting/executive"
  "05_engine/reporting/governance"
  "05_engine/reporting/charts"
  "05_engine/reporting/narratives"
  "05_engine/reporting/templates"
  "05_engine/reporting/pdf"
  "05_engine/reporting/memory"
  "05_engine/reporting/comparators"
  "05_engine/reporting/serializers"
  "05_engine/reporting/delivery"
  "05_engine/data_capture/role_inputs"
  "05_engine/data_capture/daily_logs"
  "05_engine/data_capture/validation"
  "05_engine/data_capture/assignments"
  "05_engine/data_capture/reminders"
  "05_engine/orchestration"
  "05_engine/types"
  "06_data/schemas"
  "06_data/migrations"
  "06_data/seeds"
  "06_data/fixtures"
  "06_data/storage"
  "07_app/api/diagnostics"
  "07_app/api/twins"
  "07_app/api/simulations"
  "07_app/api/reports/weekly"
  "07_app/api/reports/monthly"
  "07_app/api/reports/generate"
  "07_app/api/reports/download"
  "07_app/api/reports/send"
  "07_app/api/governance/score"
  "07_app/api/governance/levels"
  "07_app/api/governance/badges"
  "07_app/api/governance/progress"
  "07_app/api/governance/history"
  "07_app/api/data-capture/daily"
  "07_app/api/data-capture/role-input"
  "07_app/api/data-capture/validations"
  "07_app/api/data-capture/completeness"
  "07_app/api/ai-governance/policies"
  "07_app/api/ai-governance/audit"
  "07_app/api/ai-governance/registry"
  "07_app/api/ai-governance/control"
  "07_app/api/health"
  "07_app/web/dashboard"
  "07_app/web/twin-view"
  "07_app/web/diagnostics-view"
  "07_app/web/simulation-view"
  "07_app/web/reports-view"
  "07_app/web/governance-view"
  "07_app/web/governance-progress-view"
  "07_app/web/badge-view"
  "07_app/web/daily-capture-view"
  "07_app/web/role-capture-view"
  "07_app/web/governance-admin-view"
  "07_app/shared/types"
  "07_app/shared/ui"
  "07_app/shared/utils"
  "08_agents/monitoring/anomaly_detection"
  "08_agents/monitoring/reporting_watch"
  "08_agents/monitoring/capture_watch"
  "08_agents/operational/kitchen_optimization"
  "08_agents/operational/inventory_risk"
  "08_agents/operational/staffing_analysis"
  "08_agents/operational/revenue_patterns"
  "08_agents/governance/policy_guard"
  "08_agents/governance/action_validator"
  "08_agents/governance/explainability_guard"
  "08_agents/governance/audit_agent"
  "08_agents/governance/governance_progress_agent"
  "08_agents/governance/badge_integrity_agent"
  "08_agents/orchestration"
  "08_agents/prompts"
  "09_governance/architecture"
  "09_governance/standards"
  "09_governance/versioning"
  "09_governance/contract_policy"
  "09_governance/change_control"
  "09_governance/compliance"
  "09_governance/scoring/dimension_policy"
  "09_governance/scoring/weight_policy"
  "09_governance/scoring/level_thresholds"
  "09_governance/scoring/badge_award_policy"
  "09_governance/ai/policies"
  "09_governance/ai/escalation"
  "09_governance/ai/permissions"
  "09_governance/ai/audit_rules"
  "09_governance/ai/model_governance"
  "09_governance/reporting/delivery_policy"
  "09_governance/reporting/template_control"
  "09_governance/reporting/document_classification"
  "10_examples/intake_payloads"
  "10_examples/twin_states"
  "10_examples/diagnostics"
  "10_examples/simulations"
  "10_examples/weekly_reports"
  "10_examples/monthly_reports"
  "10_examples/governance_scores"
  "10_examples/badge_examples"
  "10_examples/role_capture_samples"
  "11_tests/contracts"
  "11_tests/ontology"
  "11_tests/twin"
  "11_tests/engine"
  "11_tests/reporting"
  "11_tests/governance_scoring"
  "11_tests/badge_system"
  "11_tests/data_capture"
  "11_tests/ai_governance"
  "11_tests/api"
  "11_tests/integration"
  "12_sectors/restaurants/ontology"
  "12_sectors/restaurants/metrics"
  "12_sectors/restaurants/diagnostics"
  "12_sectors/restaurants/workflows"
  "12_sectors/restaurants/reporting"
  "12_sectors/restaurants/examples"
  "12_sectors/retail/ontology"
  "12_sectors/retail/metrics"
  "12_sectors/retail/diagnostics"
  "12_sectors/retail/workflows"
  "12_sectors/retail/reporting"
  "12_sectors/retail/examples"
  "12_sectors/services/ontology"
  "12_sectors/services/metrics"
  "12_sectors/services/diagnostics"
  "12_sectors/services/workflows"
  "12_sectors/services/reporting"
  "12_sectors/services/examples"
  "12_sectors/healthcare/ontology"
  "12_sectors/healthcare/metrics"
  "12_sectors/healthcare/diagnostics"
  "12_sectors/healthcare/workflows"
  "12_sectors/healthcare/reporting"
  "12_sectors/healthcare/examples"
  "12_sectors/construction/ontology"
  "12_sectors/construction/metrics"
  "12_sectors/construction/diagnostics"
  "12_sectors/construction/workflows"
  "12_sectors/construction/reporting"
  "12_sectors/construction/examples"
  "12_sectors/education/ontology"
  "12_sectors/education/metrics"
  "12_sectors/education/diagnostics"
  "12_sectors/education/workflows"
  "12_sectors/education/reporting"
  "12_sectors/education/examples"
  "12_sectors/technology/ontology"
  "12_sectors/technology/metrics"
  "12_sectors/technology/diagnostics"
  "12_sectors/technology/workflows"
  "12_sectors/technology/reporting"
  "12_sectors/technology/examples"
  "12_sectors/logistics/ontology"
  "12_sectors/logistics/metrics"
  "12_sectors/logistics/diagnostics"
  "12_sectors/logistics/workflows"
  "12_sectors/logistics/reporting"
  "12_sectors/logistics/examples"
  "12_sectors/general_ops/ontology"
  "12_sectors/general_ops/metrics"
  "12_sectors/general_ops/diagnostics"
  "12_sectors/general_ops/workflows"
  "12_sectors/general_ops/reporting"
  "12_sectors/general_ops/examples"
)

for dir in "${DIRS[@]}"; do
  ensure_dir "$dir"
done

# -------------------------------------------------------------------
# REGISTRY FILES
# -------------------------------------------------------------------
REGISTRY_FILES=(
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

for file in "${REGISTRY_FILES[@]}"; do
  ensure_json_array_file "$file"
done

# -------------------------------------------------------------------
# DOCS
# -------------------------------------------------------------------
ensure_md_file "01_docs/SYSTEM_FILES_LOCK.md" "SYSTEM FILES LOCK"
ensure_md_file "01_docs/ARCHITECTURE_PRINCIPLES.md" "ARCHITECTURE PRINCIPLES"
ensure_md_file "01_docs/CANONICAL_SYSTEM_FLOW.md" "CANONICAL SYSTEM FLOW"
ensure_md_file "01_docs/DIGITAL_TWIN_PRINCIPLE.md" "DIGITAL TWIN PRINCIPLE"
ensure_md_file "01_docs/REPORTING_PRINCIPLE.md" "REPORTING PRINCIPLE"
ensure_md_file "01_docs/AI_GOVERNANCE_PRINCIPLE.md" "AI GOVERNANCE PRINCIPLE"
ensure_md_file "01_docs/DATA_CAPTURE_PRINCIPLE.md" "DATA CAPTURE PRINCIPLE"
ensure_md_file "01_docs/GOVERNANCE_SCORING_PRINCIPLE.md" "GOVERNANCE SCORING PRINCIPLE"
ensure_md_file "01_docs/MATURITY_LEVELS_PRINCIPLE.md" "MATURITY LEVELS PRINCIPLE"
ensure_md_file "01_docs/BADGE_SYSTEM_PRINCIPLE.md" "BADGE SYSTEM PRINCIPLE"
ensure_md_file "01_docs/SECTOR_ARCHITECTURE_PRINCIPLE.md" "SECTOR ARCHITECTURE PRINCIPLE"
ensure_md_file "01_docs/DOMAIN_MODEL_OVERVIEW.md" "DOMAIN MODEL OVERVIEW"
ensure_md_file "01_docs/REPO_GOVERNANCE.md" "REPO GOVERNANCE"
ensure_md_file "01_docs/MODULE_BOUNDARIES.md" "MODULE BOUNDARIES"
ensure_md_file "01_docs/DECISION_LOG.md" "DECISION LOG"

# -------------------------------------------------------------------
# CONTRACTS
# -------------------------------------------------------------------
CONTRACT_FILES=(
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

for file in "${CONTRACT_FILES[@]}"; do
  ensure_json_array_file "$file"
done

# -------------------------------------------------------------------
# ONTOLOGY
# -------------------------------------------------------------------
ONTOLOGY_TS_FILES=(
  "03_ontology/entities/organization.entity.ts:organizationEntity"
  "03_ontology/entities/sector.entity.ts:sectorEntity"
  "03_ontology/entities/site.entity.ts:siteEntity"
  "03_ontology/entities/role.entity.ts:roleEntity"
  "03_ontology/entities/workflow.entity.ts:workflowEntity"
  "03_ontology/entities/resource.entity.ts:resourceEntity"
  "03_ontology/entities/demand_unit.entity.ts:demandUnitEntity"
  "03_ontology/entities/report.entity.ts:reportEntity"
  "03_ontology/entities/ai_agent.entity.ts:aiAgentEntity"
  "03_ontology/entities/data_capture_actor.entity.ts:dataCaptureActorEntity"
  "03_ontology/entities/governance_score.entity.ts:governanceScoreEntity"
  "03_ontology/entities/maturity_level.entity.ts:maturityLevelEntity"
  "03_ontology/entities/badge.entity.ts:badgeEntity"
  "03_ontology/relationships/belongs_to_sector.relationship.ts:belongsToSectorRelationship"
  "03_ontology/relationships/dependency.relationship.ts:dependencyRelationship"
  "03_ontology/relationships/execution.relationship.ts:executionRelationship"
  "03_ontology/relationships/consumption.relationship.ts:consumptionRelationship"
  "03_ontology/relationships/blockage.relationship.ts:blockageRelationship"
  "03_ontology/relationships/reports_on.relationship.ts:reportsOnRelationship"
  "03_ontology/relationships/monitors.relationship.ts:monitorsRelationship"
  "03_ontology/relationships/submitted_by.relationship.ts:submittedByRelationship"
  "03_ontology/relationships/scored_by.relationship.ts:scoredByRelationship"
  "03_ontology/relationships/classified_as.relationship.ts:classifiedAsRelationship"
  "03_ontology/relationships/awarded_badge.relationship.ts:awardedBadgeRelationship"
  "03_ontology/sectors/restaurants.sector.ts:restaurantsSector"
  "03_ontology/sectors/retail.sector.ts:retailSector"
  "03_ontology/sectors/services.sector.ts:servicesSector"
  "03_ontology/sectors/healthcare.sector.ts:healthcareSector"
  "03_ontology/sectors/construction.sector.ts:constructionSector"
  "03_ontology/sectors/education.sector.ts:educationSector"
  "03_ontology/sectors/technology.sector.ts:technologySector"
  "03_ontology/sectors/logistics.sector.ts:logisticsSector"
  "03_ontology/sectors/general_ops.sector.ts:generalOpsSector"
  "03_ontology/states/stable.state.ts:stableState"
  "03_ontology/states/fragile.state.ts:fragileState"
  "03_ontology/states/saturated.state.ts:saturatedState"
  "03_ontology/states/constrained.state.ts:constrainedState"
  "03_ontology/states/recovering.state.ts:recoveringState"
  "03_ontology/states/degraded.state.ts:degradedState"
  "03_ontology/states/level_0_unstructured.state.ts:level0UnstructuredState"
  "03_ontology/states/level_1_observable.state.ts:level1ObservableState"
  "03_ontology/states/level_2_structured.state.ts:level2StructuredState"
  "03_ontology/states/level_3_governed.state.ts:level3GovernedState"
  "03_ontology/states/level_4_adaptive.state.ts:level4AdaptiveState"
  "03_ontology/states/level_5_ai_governed.state.ts:level5AiGovernedState"
  "03_ontology/constraints/capacity.constraint.ts:capacityConstraint"
  "03_ontology/constraints/coordination.constraint.ts:coordinationConstraint"
  "03_ontology/constraints/flow.constraint.ts:flowConstraint"
  "03_ontology/constraints/reporting.constraint.ts:reportingConstraint"
  "03_ontology/constraints/maturity.constraint.ts:maturityConstraint"
  "03_ontology/signals/latency.signal.ts:latencySignal"
  "03_ontology/signals/leakage.signal.ts:leakageSignal"
  "03_ontology/signals/volatility.signal.ts:volatilitySignal"
  "03_ontology/signals/reporting_gap.signal.ts:reportingGapSignal"
  "03_ontology/signals/capture_failure.signal.ts:captureFailureSignal"
  "03_ontology/signals/governance_gain.signal.ts:governanceGainSignal"
  "03_ontology/signals/governance_drop.signal.ts:governanceDropSignal"
  "03_ontology/signals/maturity_transition.signal.ts:maturityTransitionSignal"
  "03_ontology/workflows/service_delivery.workflow.ts:serviceDeliveryWorkflow"
  "03_ontology/workflows/operational_cycle.workflow.ts:operationalCycleWorkflow"
  "03_ontology/workflows/reporting_cycle.workflow.ts:reportingCycleWorkflow"
  "03_ontology/workflows/data_capture.workflow.ts:dataCaptureWorkflow"
  "03_ontology/workflows/governance_progress.workflow.ts:governanceProgressWorkflow"
  "03_ontology/registry/ontology_registry.ts:ontologyRegistry"
  "03_ontology/types/ontology_types.ts:ontologyTypes"
)

for item in "${ONTOLOGY_TS_FILES[@]}"; do
  file="${item%%:*}"
  symbol="${item##*:}"
  ensure_ts_file "$file" "$symbol"
done

# -------------------------------------------------------------------
# TWIN
# -------------------------------------------------------------------
TWIN_TS_FILES=(
  "04_twin/crcp/crcp_model.ts:crcpModel"
  "04_twin/crcp/crcp_builder.ts:crcpBuilder"
  "04_twin/crcp/crcp_validator.ts:crcpValidator"
  "04_twin/structural/structural_model.ts:structuralModel"
  "04_twin/structural/structural_builder.ts:structuralBuilder"
  "04_twin/structural/structural_validator.ts:structuralValidator"
  "04_twin/operational/operational_model.ts:operationalModel"
  "04_twin/operational/operational_builder.ts:operationalBuilder"
  "04_twin/operational/operational_validator.ts:operationalValidator"
  "04_twin/behavioral/behavioral_model.ts:behavioralModel"
  "04_twin/behavioral/behavioral_builder.ts:behavioralBuilder"
  "04_twin/behavioral/behavioral_validator.ts:behavioralValidator"
  "04_twin/strategic/strategic_model.ts:strategicModel"
  "04_twin/strategic/strategic_builder.ts:strategicBuilder"
  "04_twin/strategic/strategic_validator.ts:strategicValidator"
  "04_twin/governance/governance_model.ts:governanceModel"
  "04_twin/governance/governance_builder.ts:governanceBuilder"
  "04_twin/governance/governance_validator.ts:governanceValidator"
  "04_twin/governance/governance_progress_model.ts:governanceProgressModel"
  "04_twin/snapshots/twin_snapshot.ts:twinSnapshot"
  "04_twin/snapshots/structural_snapshot.ts:structuralSnapshot"
  "04_twin/snapshots/diagnostic_snapshot.ts:diagnosticSnapshot"
  "04_twin/snapshots/reporting_snapshot.ts:reportingSnapshot"
  "04_twin/snapshots/simulation_snapshot.ts:simulationSnapshot"
  "04_twin/snapshots/governance_snapshot.ts:governanceSnapshot"
  "04_twin/snapshots/maturity_snapshot.ts:maturitySnapshot"
  "04_twin/lineage/twin_lineage.ts:twinLineage"
  "04_twin/lineage/lineage_resolver.ts:lineageResolver"
  "04_twin/lineage/lineage_audit.ts:lineageAudit"
  "04_twin/state_models/twin_state_machine.ts:twinStateMachine"
  "04_twin/state_models/state_classifier.ts:stateClassifier"
  "04_twin/state_models/state_transition_rules.ts:stateTransitionRules"
  "04_twin/state_models/maturity_state_machine.ts:maturityStateMachine"
  "04_twin/state_models/governance_transition_rules.ts:governanceTransitionRules"
  "04_twin/twin_builder/build_twin.ts:buildTwin"
  "04_twin/twin_builder/validate_twin.ts:validateTwin"
  "04_twin/twin_builder/publish_twin.ts:publishTwin"
  "04_twin/twin_builder/twin_integrity_checks.ts:twinIntegrityChecks"
  "04_twin/types/twin_types.ts:twinTypes"
)

for item in "${TWIN_TS_FILES[@]}"; do
  file="${item%%:*}"
  symbol="${item##*:}"
  ensure_ts_file "$file" "$symbol"
done

# -------------------------------------------------------------------
# ENGINE
# -------------------------------------------------------------------
ENGINE_TS_FILES=(
  "05_engine/intake/intake_orchestrator.ts:intakeOrchestrator"
  "05_engine/normalization/field_mapping.ts:fieldMapping"
  "05_engine/normalization/normalization_rules.ts:normalizationRules"
  "05_engine/normalization/standardizers.ts:standardizers"
  "05_engine/normalization/normalization_engine.ts:normalizationEngine"
  "05_engine/mapping/entity_mapper.ts:entityMapper"
  "05_engine/mapping/relationship_mapper.ts:relationshipMapper"
  "05_engine/mapping/mapping_engine.ts:mappingEngine"
  "05_engine/metrics/metrics_engine.ts:metricsEngine"
  "05_engine/diagnostics/diagnostic_engine.ts:diagnosticEngine"
  "05_engine/scoring/structural_score.ts:structuralScore"
  "05_engine/scoring/operational_score.ts:operationalScore"
  "05_engine/scoring/governance/governance_score_engine.ts:governanceScoreEngine"
  "05_engine/scoring/governance/dimension_scores.ts:dimensionScores"
  "05_engine/scoring/governance/scoring_weights.ts:scoringWeights"
  "05_engine/scoring/governance/maturity_level_classifier.ts:maturityLevelClassifier"
  "05_engine/scoring/governance/governance_progress.ts:governanceProgress"
  "05_engine/scoring/governance/badge_generator.ts:badgeGenerator"
  "05_engine/scoring/governance/governance_snapshot_builder.ts:governanceSnapshotBuilder"
  "05_engine/scoring/governance/governance_validator.ts:governanceValidator"
  "05_engine/scoring/score_engine.ts:scoreEngine"
  "05_engine/simulation/scenario_runner.ts:scenarioRunner"
  "05_engine/simulation/simulation_models.ts:simulationModels"
  "05_engine/simulation/simulation_engine.ts:simulationEngine"
  "05_engine/reporting/weekly/weekly_report_builder.ts:weeklyReportBuilder"
  "05_engine/reporting/weekly/weekly_payload.ts:weeklyPayload"
  "05_engine/reporting/weekly/weekly_validator.ts:weeklyValidator"
  "05_engine/reporting/monthly/monthly_report_builder.ts:monthlyReportBuilder"
  "05_engine/reporting/monthly/monthly_payload.ts:monthlyPayload"
  "05_engine/reporting/monthly/monthly_validator.ts:monthlyValidator"
  "05_engine/reporting/executive/executive_summary_builder.ts:executiveSummaryBuilder"
  "05_engine/reporting/executive/executive_recommendation_builder.ts:executiveRecommendationBuilder"
  "05_engine/reporting/governance/governance_section_builder.ts:governanceSectionBuilder"
  "05_engine/reporting/governance/maturity_progress_section.ts:maturityProgressSection"
  "05_engine/reporting/governance/badge_status_section.ts:badgeStatusSection"
  "05_engine/reporting/governance/governance_chart_builder.ts:governanceChartBuilder"
  "05_engine/reporting/charts/chart_engine.ts:chartEngine"
  "05_engine/reporting/charts/trend_chart.ts:trendChart"
  "05_engine/reporting/charts/state_transition_chart.ts:stateTransitionChart"
  "05_engine/reporting/charts/risk_exposure_chart.ts:riskExposureChart"
  "05_engine/reporting/charts/progress_chart.ts:progressChart"
  "05_engine/reporting/charts/governance_score_chart.ts:governanceScoreChart"
  "05_engine/reporting/charts/maturity_progress_chart.ts:maturityProgressChart"
  "05_engine/reporting/narratives/narrative_engine.ts:narrativeEngine"
  "05_engine/reporting/narratives/weekly_narrative.ts:weeklyNarrative"
  "05_engine/reporting/narratives/monthly_narrative.ts:monthlyNarrative"
  "05_engine/reporting/narratives/governance_narrative.ts:governanceNarrative"
  "05_engine/reporting/narratives/executive_tone_rules.ts:executiveToneRules"
  "05_engine/reporting/templates/weekly_template.ts:weeklyTemplate"
  "05_engine/reporting/templates/monthly_template.ts:monthlyTemplate"
  "05_engine/reporting/templates/executive_template.ts:executiveTemplate"
  "05_engine/reporting/templates/governance_template.ts:governanceTemplate"
  "05_engine/reporting/pdf/pdf_renderer.ts:pdfRenderer"
  "05_engine/reporting/pdf/pdf_layout.ts:pdfLayout"
  "05_engine/reporting/pdf/header_builder.ts:headerBuilder"
  "05_engine/reporting/pdf/footer_builder.ts:footerBuilder"
  "05_engine/reporting/pdf/style_tokens.ts:styleTokens"
  "05_engine/reporting/memory/report_memory_engine.ts:reportMemoryEngine"
  "05_engine/reporting/memory/report_comparison.ts:reportComparison"
  "05_engine/reporting/memory/recommendation_tracking.ts:recommendationTracking"
  "05_engine/reporting/memory/report_history_builder.ts:reportHistoryBuilder"
  "05_engine/reporting/memory/governance_history_builder.ts:governanceHistoryBuilder"
  "05_engine/reporting/comparators/week_over_week.ts:weekOverWeek"
  "05_engine/reporting/comparators/month_over_month.ts:monthOverMonth"
  "05_engine/reporting/comparators/rolling_window.ts:rollingWindow"
  "05_engine/reporting/comparators/baseline_comparator.ts:baselineComparator"
  "05_engine/reporting/comparators/governance_level_comparator.ts:governanceLevelComparator"
  "05_engine/reporting/serializers/report_payload_serializer.ts:reportPayloadSerializer"
  "05_engine/reporting/serializers/chart_asset_serializer.ts:chartAssetSerializer"
  "05_engine/reporting/delivery/email_delivery.ts:emailDelivery"
  "05_engine/reporting/delivery/secure_download.ts:secureDownload"
  "05_engine/reporting/delivery/delivery_log.ts:deliveryLog"
  "05_engine/reporting/report_builder.ts:reportBuilder"
  "05_engine/reporting/reporting_orchestrator.ts:reportingOrchestrator"
  "05_engine/data_capture/capture_engine.ts:captureEngine"
  "05_engine/data_capture/role_capture_builder.ts:roleCaptureBuilder"
  "05_engine/data_capture/daily_capture_validator.ts:dailyCaptureValidator"
  "05_engine/data_capture/capture_completeness_score.ts:captureCompletenessScore"
  "05_engine/orchestration/run_diagnostic.ts:runDiagnostic"
  "05_engine/orchestration/run_snapshot.ts:runSnapshot"
  "05_engine/orchestration/run_simulation.ts:runSimulation"
  "05_engine/orchestration/run_weekly_report.ts:runWeeklyReport"
  "05_engine/orchestration/run_monthly_report.ts:runMonthlyReport"
  "05_engine/orchestration/run_governance_score.ts:runGovernanceScore"
  "05_engine/orchestration/run_maturity_update.ts:runMaturityUpdate"
  "05_engine/orchestration/engine_orchestrator.ts:engineOrchestrator"
  "05_engine/types/engine_types.ts:engineTypes"
)

for item in "${ENGINE_TS_FILES[@]}"; do
  file="${item%%:*}"
  symbol="${item##*:}"
  ensure_ts_file "$file" "$symbol"
done

# -------------------------------------------------------------------
# DATA
# -------------------------------------------------------------------
DATA_SQL_FILES=(
  "06_data/schemas/organizations.sql:organizations"
  "06_data/schemas/twins.sql:twins"
  "06_data/schemas/entities.sql:entities"
  "06_data/schemas/relationships.sql:relationships"
  "06_data/schemas/events.sql:events"
  "06_data/schemas/metrics.sql:metrics"
  "06_data/schemas/diagnostics.sql:diagnostics"
  "06_data/schemas/snapshots.sql:snapshots"
  "06_data/schemas/simulations.sql:simulations"
  "06_data/schemas/reports.sql:reports"
  "06_data/schemas/report_memory.sql:report_memory"
  "06_data/schemas/report_assets.sql:report_assets"
  "06_data/schemas/report_delivery_logs.sql:report_delivery_logs"
  "06_data/schemas/data_capture_logs.sql:data_capture_logs"
  "06_data/schemas/role_assignments.sql:role_assignments"
  "06_data/schemas/intake_sessions.sql:intake_sessions"
  "06_data/schemas/validation_failures.sql:validation_failures"
  "06_data/schemas/governance_scores.sql:governance_scores"
  "06_data/schemas/governance_dimensions.sql:governance_dimensions"
  "06_data/schemas/maturity_levels.sql:maturity_levels"
  "06_data/schemas/badge_awards.sql:badge_awards"
  "06_data/schemas/governance_progress_logs.sql:governance_progress_logs"
)

for item in "${DATA_SQL_FILES[@]}"; do
  file="${item%%:*}"
  table="${item##*:}"
  ensure_sql_file "$file" "$table"
done

# -------------------------------------------------------------------
# ROOT FILES
# -------------------------------------------------------------------
ensure_file ".env.example"
ensure_file ".gitignore"
ensure_file "package.json"
ensure_file "package-lock.json"
ensure_md_file "README.md" "NEXUS CORE"
ensure_file "tsconfig.json"
ensure_file "turbo.json"

# -------------------------------------------------------------------
# AGENTS
# -------------------------------------------------------------------
ensure_ts_file "08_agents/orchestration/agent_router.ts" "agentRouter"
ensure_ts_file "08_agents/orchestration/agent_registry.ts" "agentRegistry"
ensure_ts_file "08_agents/orchestration/agent_supervisor.ts" "agentSupervisor"

# -------------------------------------------------------------------
# INIT REPORT
# -------------------------------------------------------------------
cat <<EOF

--------------------------------------------------
NEXUS INIT COMPLETE
--------------------------------------------------
Repository: $ROOT_DIR
Mode: non-destructive scaffold completion
Status: canonical baseline enforced
--------------------------------------------------

Next recommended commands:
  ./bin/nexus doctor
  ./bin/nexus validate
  git status

EOF

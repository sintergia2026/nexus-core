import { TwinSeedV2 } from "../../types/TwinSeedV2";

type SnapshotInput = {
  snapshot_id?: string;
  context: {
    organization_id: string;
    sector: string;
    subsector?: string;
    country?: string;
    city?: string;
  };
  scores: {
    operational_maturity: number;
    financial_pressure: number;
    reporting_reliability: number;
    structural_risk: number;
    commercial_strength: number;
  };
  decision: {
    decision_label: string;
    priority: "P1" | "P2" | "P3";
    readiness_level: "low" | "medium" | "high";
  };
  state_label: string;
  active_signals: Array<{
    code: string;
    severity: string;
    source_metric?: string;
  }>;
  active_constraints: Array<{
    code: string;
    severity: string;
  }>;
  created_at: string;
};

type BuildTwinSeedV2Input = {
  snapshot: SnapshotInput;
  structural_hypothesis: string;
  answered_questions: number;
  total_questions: number;
};

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const valid = values.map(clampScore);
  return roundToTwo(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function sanitizeSegment(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sanitizeTimestamp(timestamp: string): string {
  return String(timestamp || new Date().toISOString())
    .replace(/[:.]/g, "-")
    .replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function buildTwinSeedId(input: SnapshotInput): string {
  return [
    "twin_seed_v2",
    sanitizeSegment(input.context.organization_id || "unknown-org"),
    sanitizeSegment(input.context.sector || "unknown-sector"),
    sanitizeTimestamp(input.created_at),
  ].join("::");
}

function buildLineageId(organizationId: string): string {
  return `lineage::${sanitizeSegment(organizationId || "unknown-org")}`;
}

function computeStructuralVector(scores: SnapshotInput["scores"]) {
  return {
    execution: average([
      scores.operational_maturity,
      scores.structural_risk,
    ]),
    visibility: clampScore(scores.reporting_reliability),
    finance: clampScore(scores.financial_pressure),
    commercial: clampScore(scores.commercial_strength),
    coordination: average([
      scores.operational_maturity,
      scores.reporting_reliability,
      scores.structural_risk,
    ]),
  };
}

function computeGapVector(scores: SnapshotInput["scores"]) {
  const ordered = Object.entries(scores)
    .map(([key, value]) => [key, clampScore(value)] as const)
    .sort((a, b) => a[1] - b[1]);

  const weakest = ordered[0];
  const secondWeakest = ordered[1];

  return {
    weakest_dimension: weakest?.[0] ?? "unknown_dimension",
    weakest_score: weakest?.[1] ?? 0,
    second_weakest_dimension: secondWeakest?.[0],
    second_weakest_score: secondWeakest?.[1],
    gap_severity: roundToTwo(100 - (weakest?.[1] ?? 0)),
  };
}

function computeTwinConfidence(input: {
  answered_questions: number;
  total_questions: number;
  reporting_reliability: number;
  active_signals_count: number;
  active_constraints_count: number;
}) {
  const coverage =
    input.total_questions > 0
      ? (input.answered_questions / input.total_questions) * 100
      : 0;

  let score = coverage;

  if (input.reporting_reliability < 40) {
    score -= 20;
  } else if (input.reporting_reliability < 60) {
    score -= 10;
  }

  if (input.active_constraints_count >= 3) {
    score -= 10;
  }

  if (input.active_signals_count >= 4) {
    score -= 5;
  }

  score = roundToTwo(Math.max(0, Math.min(100, score)));

  const level =
    score < 45 ? "low" :
    score < 75 ? "medium" :
    "high";

  const rationale =
    level === "high"
      ? "Twin confidence is high due to strong capture coverage and acceptable structural visibility."
      : level === "medium"
      ? "Twin confidence is moderate because the capture is usable, but visibility or structural conditions still constrain interpretive certainty."
      : "Twin confidence is low due to weak visibility or insufficient evidence quality.";

  return {
    score,
    level,
    rationale,
  } as const;
}

function computeActivationPath(decision: SnapshotInput["decision"]) {
  switch (decision.decision_label) {
    case "stabilize_now":
      return {
        next_step: "stabilize_visibility_and_operational_control",
        recommended_program: "crcp_stabilization_track",
        recommended_priority: "P1" as const,
        lifecycle_stage: "stabilizing" as const,
      };

    case "contain_risk":
      return {
        next_step: "contain_structural_fragility_and_reduce_exposure",
        recommended_program: "crcp_risk_containment_track",
        recommended_priority: "P1" as const,
        lifecycle_stage: "stabilizing" as const,
      };

    case "standardize_operations":
      return {
        next_step: "standardize_reporting_execution_and_planning",
        recommended_program: "crcp_standardization_track",
        recommended_priority: "P2" as const,
        lifecycle_stage: "standardizing" as const,
      };

    default:
      return {
        next_step: "optimize_and_monitor_growth_conditions",
        recommended_program: "crcp_optimization_track",
        recommended_priority: "P3" as const,
        lifecycle_stage: "optimizing" as const,
      };
  }
}

export function buildTwinSeedV2({
  snapshot,
  structural_hypothesis,
  answered_questions,
  total_questions,
}: BuildTwinSeedV2Input): TwinSeedV2 {
  const structuralVector = computeStructuralVector(snapshot.scores);
  const gapVector = computeGapVector(snapshot.scores);

  const twinConfidence = computeTwinConfidence({
    answered_questions,
    total_questions,
    reporting_reliability: snapshot.scores.reporting_reliability,
    active_signals_count: snapshot.active_signals.length,
    active_constraints_count: snapshot.active_constraints.length,
  });

  const activationPath = computeActivationPath(snapshot.decision);

  return {
    twin_seed_id: buildTwinSeedId(snapshot),
    twin_version: "v2",
    lineage_id: buildLineageId(snapshot.context.organization_id),
    source_snapshot_id: snapshot.snapshot_id,

    context: snapshot.context,

    baseline_state: {
      state_label: snapshot.state_label,
      scores: {
        operational_maturity: clampScore(snapshot.scores.operational_maturity),
        financial_pressure: clampScore(snapshot.scores.financial_pressure),
        reporting_reliability: clampScore(snapshot.scores.reporting_reliability),
        structural_risk: clampScore(snapshot.scores.structural_risk),
        commercial_strength: clampScore(snapshot.scores.commercial_strength),
      },
      decision: snapshot.decision,
    },

    active_signals: snapshot.active_signals,
    active_constraints: snapshot.active_constraints,
    structural_hypothesis,

    structural_vector: structuralVector,
    gap_vector: gapVector,
    twin_confidence: twinConfidence,
    activation_path: activationPath,

    evidence_summary: {
      answered_questions,
      total_questions,
      coverage_percent:
        total_questions > 0
          ? roundToTwo((answered_questions / total_questions) * 100)
          : 0,
      major_signal_count: snapshot.active_signals.length,
      major_constraint_count: snapshot.active_constraints.length,
    },

    created_at: new Date().toISOString(),
  };
}
export type TwinLifecycleStage =
  | "seeded"
  | "stabilizing"
  | "standardizing"
  | "optimizing"
  | "monitoring";

export type TwinConfidenceLevel =
  | "low"
  | "medium"
  | "high";

export type TwinPriority = "P1" | "P2" | "P3";

export interface TwinStructuralVector {
  execution: number;
  visibility: number;
  finance: number;
  commercial: number;
  coordination: number;
}

export interface TwinGapVector {
  weakest_dimension: string;
  weakest_score: number;
  second_weakest_dimension?: string;
  second_weakest_score?: number;
  gap_severity: number;
}

export interface TwinActivationPath {
  next_step: string;
  recommended_program: string;
  recommended_priority: TwinPriority;
  lifecycle_stage: TwinLifecycleStage;
}

export interface TwinConfidence {
  score: number;
  level: TwinConfidenceLevel;
  rationale: string;
}

export interface TwinEvidenceSummary {
  answered_questions: number;
  total_questions: number;
  coverage_percent: number;
  major_signal_count: number;
  major_constraint_count: number;
}

export interface TwinSeedV2Context {
  organization_id: string;
  sector: string;
  subsector?: string;
  country?: string;
  city?: string;
}

export interface TwinSeedV2Scores {
  operational_maturity: number;
  financial_pressure: number;
  reporting_reliability: number;
  structural_risk: number;
  commercial_strength: number;
}

export interface TwinSeedV2Decision {
  decision_label: string;
  priority: TwinPriority;
  readiness_level: "low" | "medium" | "high";
}

export interface TwinSeedV2Signal {
  code: string;
  severity: string;
  source_metric?: string;
}

export interface TwinSeedV2Constraint {
  code: string;
  severity: string;
}

export interface TwinSeedV2 {
  twin_seed_id: string;
  twin_version: "v2";
  lineage_id: string;
  source_snapshot_id?: string;

  context: TwinSeedV2Context;

  baseline_state: {
    state_label: string;
    scores: TwinSeedV2Scores;
    decision: TwinSeedV2Decision;
  };

  active_signals: TwinSeedV2Signal[];
  active_constraints: TwinSeedV2Constraint[];
  structural_hypothesis: string;

  structural_vector: TwinStructuralVector;
  gap_vector: TwinGapVector;
  twin_confidence: TwinConfidence;
  activation_path: TwinActivationPath;
  evidence_summary: TwinEvidenceSummary;

  created_at: string;
}
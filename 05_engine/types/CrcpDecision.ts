export type CrcpDecisionLabel =
  | "stabilize_now"
  | "contain_risk"
  | "standardize_operations"
  | "optimize_growth";

export type CrcpPriority =
  | "P1"
  | "P2"
  | "P3";

export type CrcpReadinessLevel =
  | "low"
  | "medium"
  | "high";

export interface CrcpDecision {
  decision_label: CrcpDecisionLabel;
  priority: CrcpPriority;
  readiness_level: CrcpReadinessLevel;
}
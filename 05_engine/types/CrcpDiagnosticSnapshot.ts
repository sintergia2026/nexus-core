import { CrcpBaselineScores } from "./CrcpBaselineScores";
import { CrcpContext } from "./CrcpIntakePayload";
import { CrcpDecision } from "./CrcpDecision";

export type CrcpStateLabel =
  | "stable"
  | "degraded"
  | "fragile"
  | "critical";

export interface CrcpSignal {
  code: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source_metric?: string;
}

export interface CrcpConstraint {
  code: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface CrcpDiagnosticSnapshot {
  context: CrcpContext;
  scores: CrcpBaselineScores;
  decision: CrcpDecision;
  state_label: CrcpStateLabel;
  active_signals: CrcpSignal[];
  active_constraints: CrcpConstraint[];
  executive_summary: string;
  created_at: string;
}
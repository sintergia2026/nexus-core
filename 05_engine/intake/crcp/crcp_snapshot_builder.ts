import { CrcpBaselineScores } from "../../types/CrcpBaselineScores";
import { CrcpDecision } from "../../types/CrcpDecision";
import {
  CrcpConstraint,
  CrcpDiagnosticSnapshot,
  CrcpSignal,
  CrcpStateLabel,
} from "../../types/CrcpDiagnosticSnapshot";
import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";

function deriveStateLabel(
  scores: CrcpBaselineScores,
  decision: CrcpDecision
): CrcpStateLabel {
  if (
    decision.priority === "P1" &&
    (scores.reporting_reliability < 25 || scores.structural_risk < 35)
  ) {
    return "critical";
  }

  if (decision.priority === "P1") {
    return "fragile";
  }

  if (decision.priority === "P2") {
    return "degraded";
  }

  return "stable";
}

function deriveSignals(scores: CrcpBaselineScores): CrcpSignal[] {
  const signals: CrcpSignal[] = [];

  if (scores.reporting_reliability < 25) {
    signals.push({
      code: "reporting_gap_signal",
      severity: "CRITICAL",
      source_metric: "reporting_reliability",
    });
  } else if (scores.reporting_reliability < 45) {
    signals.push({
      code: "reporting_gap_signal",
      severity: "HIGH",
      source_metric: "reporting_reliability",
    });
  }

  if (scores.operational_maturity < 40) {
    signals.push({
      code: "operational_instability_signal",
      severity: "HIGH",
      source_metric: "operational_maturity",
    });
  } else if (scores.operational_maturity < 55) {
    signals.push({
      code: "operational_instability_signal",
      severity: "MEDIUM",
      source_metric: "operational_maturity",
    });
  }

  if (scores.financial_pressure < 40) {
    signals.push({
      code: "financial_stress_signal",
      severity: "HIGH",
      source_metric: "financial_pressure",
    });
  } else if (scores.financial_pressure < 55) {
    signals.push({
      code: "financial_stress_signal",
      severity: "MEDIUM",
      source_metric: "financial_pressure",
    });
  }

  if (scores.commercial_strength < 45) {
    signals.push({
      code: "commercial_weakness_signal",
      severity: "MEDIUM",
      source_metric: "commercial_strength",
    });
  }

  return signals;
}

function deriveConstraints(scores: CrcpBaselineScores): CrcpConstraint[] {
  const constraints: CrcpConstraint[] = [];

  if (scores.reporting_reliability < 40) {
    constraints.push({
      code: "reporting_visibility_constraint",
      severity: scores.reporting_reliability < 25 ? "CRITICAL" : "HIGH",
    });
  }

  if (scores.structural_risk < 45) {
    constraints.push({
      code: "structural_fragility_constraint",
      severity: scores.structural_risk < 30 ? "CRITICAL" : "HIGH",
    });
  }

  if (scores.financial_pressure < 45) {
    constraints.push({
      code: "financial_control_constraint",
      severity: scores.financial_pressure < 30 ? "CRITICAL" : "HIGH",
    });
  }

  return constraints;
}

function buildExecutiveSummary(
  snapshot: Pick<
    CrcpDiagnosticSnapshot,
    "state_label" | "decision" | "active_signals" | "active_constraints"
  >
): string {
  const signalCodes = snapshot.active_signals.map((signal) => signal.code);
  const constraintCodes = snapshot.active_constraints.map(
    (constraint) => constraint.code
  );

  return [
    `The client is currently in a ${snapshot.state_label.toUpperCase()} operational state.`,
    `Recommended decision: ${snapshot.decision.decision_label}.`,
    signalCodes.length > 0
      ? `Primary signals detected: ${signalCodes.join(", ")}.`
      : `No major structural signals detected.`,
    constraintCodes.length > 0
      ? `Primary constraints: ${constraintCodes.join(", ")}.`
      : `No active structural constraints detected.`,
  ].join(" ");
}

export function buildCrcpDiagnosticSnapshot(
  payload: CrcpIntakePayload,
  scores: CrcpBaselineScores,
  decision: CrcpDecision
): CrcpDiagnosticSnapshot {
  const stateLabel = deriveStateLabel(scores, decision);
  const activeSignals = deriveSignals(scores);
  const activeConstraints = deriveConstraints(scores);

  const executiveSummary = buildExecutiveSummary({
    state_label: stateLabel,
    decision,
    active_signals: activeSignals,
    active_constraints: activeConstraints,
  });

  return {
    context: payload.context,
    scores,
    decision,
    state_label: stateLabel,
    active_signals: activeSignals,
    active_constraints: activeConstraints,
    executive_summary: executiveSummary,
    created_at: new Date().toISOString(),
  };
}
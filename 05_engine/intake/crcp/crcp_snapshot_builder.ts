import { CrcpBaselineScores } from "../../types/CrcpBaselineScores";
import { CrcpDecision } from "../../types/CrcpDecision";
import {
  CrcpConstraint,
  CrcpDiagnosticSnapshot,
  CrcpSignal,
  CrcpStateLabel,
} from "../../types/CrcpDiagnosticSnapshot";
import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function severityFromScore(
  score: number,
  criticalThreshold: number,
  highThreshold: number,
  mediumThreshold: number
): "CRITICAL" | "HIGH" | "MEDIUM" | null {
  if (score < criticalThreshold) {
    return "CRITICAL";
  }

  if (score < highThreshold) {
    return "HIGH";
  }

  if (score < mediumThreshold) {
    return "MEDIUM";
  }

  return null;
}

function deriveStateLabel(
  scores: CrcpBaselineScores,
  decision: CrcpDecision
): CrcpStateLabel {
  const reportingReliability = clampScore(scores.reporting_reliability);
  const structuralRisk = clampScore(scores.structural_risk);
  const operationalMaturity = clampScore(scores.operational_maturity);
  const financialPressure = clampScore(scores.financial_pressure);
  const commercialStrength = clampScore(scores.commercial_strength);

  const visibilityCollapse =
    reportingReliability < 30 ||
    (reportingReliability < 40 && structuralRisk < 40);

  const structuralCollapse =
    structuralRisk < 30 ||
    (operationalMaturity < 35 && structuralRisk < 40);

  const compoundCriticalFragility =
    reportingReliability < 45 &&
    structuralRisk < 45 &&
    financialPressure < 45;

  if (visibilityCollapse || structuralCollapse || compoundCriticalFragility) {
    return "critical";
  }

  if (
    decision.priority === "P1" ||
    operationalMaturity < 45 ||
    financialPressure < 45 ||
    commercialStrength < 40
  ) {
    return "fragile";
  }

  if (
    decision.priority === "P2" ||
    operationalMaturity < 60 ||
    reportingReliability < 60 ||
    structuralRisk < 60
  ) {
    return "degraded";
  }

  return "stable";
}

function deriveSignals(scores: CrcpBaselineScores): CrcpSignal[] {
  const signals: CrcpSignal[] = [];

  const operationalMaturity = clampScore(scores.operational_maturity);
  const financialPressure = clampScore(scores.financial_pressure);
  const reportingReliability = clampScore(scores.reporting_reliability);
  const structuralRisk = clampScore(scores.structural_risk);
  const commercialStrength = clampScore(scores.commercial_strength);

  const reportingSeverity = severityFromScore(
    reportingReliability,
    35,
    45,
    60
  );
  if (reportingSeverity) {
    signals.push({
      code: "reporting_gap_signal",
      severity: reportingSeverity,
      source_metric: "reporting_reliability",
    });
  }

  const operationalSeverity = severityFromScore(
    operationalMaturity,
    35,
    45,
    60
  );
  if (operationalSeverity) {
    signals.push({
      code: "operational_instability_signal",
      severity: operationalSeverity,
      source_metric: "operational_maturity",
    });
  }

  const financialSeverity = severityFromScore(
    financialPressure,
    35,
    45,
    60
  );
  if (financialSeverity) {
    signals.push({
      code: "financial_stress_signal",
      severity: financialSeverity,
      source_metric: "financial_pressure",
    });
  }

  const structuralSeverity = severityFromScore(
    structuralRisk,
    35,
    45,
    60
  );
  if (structuralSeverity) {
    signals.push({
      code: "structural_fragility_signal",
      severity: structuralSeverity,
      source_metric: "structural_risk",
    });
  }

  const commercialSeverity = severityFromScore(
    commercialStrength,
    30,
    40,
    55
  );
  if (commercialSeverity) {
    signals.push({
      code: "commercial_weakness_signal",
      severity: commercialSeverity,
      source_metric: "commercial_strength",
    });
  }

  if (reportingReliability < 45 && structuralRisk < 45) {
    signals.push({
      code: "visibility_risk_compound_signal",
      severity:
        reportingReliability < 35 || structuralRisk < 35 ? "CRITICAL" : "HIGH",
      source_metric: "compound_visibility_structural",
    });
  }

  if (
    reportingReliability < 45 &&
    structuralRisk < 45 &&
    financialPressure < 45
  ) {
    signals.push({
      code: "multi_domain_fragility_signal",
      severity: "CRITICAL",
      source_metric: "compound_multi_domain",
    });
  }

  return signals;
}

function deriveConstraints(scores: CrcpBaselineScores): CrcpConstraint[] {
  const constraints: CrcpConstraint[] = [];

  const reportingReliability = clampScore(scores.reporting_reliability);
  const structuralRisk = clampScore(scores.structural_risk);
  const financialPressure = clampScore(scores.financial_pressure);
  const operationalMaturity = clampScore(scores.operational_maturity);
  const commercialStrength = clampScore(scores.commercial_strength);

  if (reportingReliability < 60) {
    constraints.push({
      code: "reporting_visibility_constraint",
      severity: reportingReliability < 35 ? "CRITICAL" : "HIGH",
    });
  }

  if (structuralRisk < 60) {
    constraints.push({
      code: "structural_fragility_constraint",
      severity: structuralRisk < 35 ? "CRITICAL" : "HIGH",
    });
  }

  if (financialPressure < 60) {
    constraints.push({
      code: "financial_control_constraint",
      severity: financialPressure < 35 ? "CRITICAL" : "HIGH",
    });
  }

  if (operationalMaturity < 55) {
    constraints.push({
      code: "execution_standardization_constraint",
      severity: operationalMaturity < 40 ? "CRITICAL" : "HIGH",
    });
  }

  if (commercialStrength < 50) {
    constraints.push({
      code: "commercial_instability_constraint",
      severity: commercialStrength < 35 ? "CRITICAL" : "HIGH",
    });
  }

  if (reportingReliability < 45 && structuralRisk < 45) {
    constraints.push({
      code: "visibility_structural_compound_constraint",
      severity:
        reportingReliability < 35 || structuralRisk < 35 ? "CRITICAL" : "HIGH",
    });
  }

  return constraints;
}

function buildExecutiveSummary(
  snapshot: Pick<
    CrcpDiagnosticSnapshot,
    "state_label" | "decision" | "active_signals" | "active_constraints" | "scores"
  >
): string {
  const signalCodes = snapshot.active_signals.map((signal) => signal.code);
  const constraintCodes = snapshot.active_constraints.map(
    (constraint) => constraint.code
  );

  const weakestDimension = Object.entries(snapshot.scores).sort(
    (a, b) => a[1] - b[1]
  )[0];

  const weakestLabel = weakestDimension
    ? weakestDimension[0]
    : "unknown_dimension";

  const weakestScore = weakestDimension
    ? Math.round(weakestDimension[1] * 100) / 100
    : 0;

  return [
    `The client is currently in a ${snapshot.state_label.toUpperCase()} structural state.`,
    `Recommended decision: ${snapshot.decision.decision_label} with priority ${snapshot.decision.priority}.`,
    `Lowest-performing dimension: ${weakestLabel} (${weakestScore}).`,
    signalCodes.length > 0
      ? `Primary signals detected: ${signalCodes.join(", ")}.`
      : `No major structural signals detected.`,
    constraintCodes.length > 0
      ? `Primary constraints active: ${constraintCodes.join(", ")}.`
      : `No active structural constraints detected.`,
  ].join(" ");
}

export function buildCrcpDiagnosticSnapshot(
  payload: CrcpIntakePayload,
  scores: CrcpBaselineScores,
  decision: CrcpDecision
): CrcpDiagnosticSnapshot {
  const normalizedScores: CrcpBaselineScores = {
    operational_maturity: clampScore(scores.operational_maturity),
    financial_pressure: clampScore(scores.financial_pressure),
    reporting_reliability: clampScore(scores.reporting_reliability),
    structural_risk: clampScore(scores.structural_risk),
    commercial_strength: clampScore(scores.commercial_strength),
  };

  const stateLabel = deriveStateLabel(normalizedScores, decision);
  const activeSignals = deriveSignals(normalizedScores);
  const activeConstraints = deriveConstraints(normalizedScores);

  const executiveSummary = buildExecutiveSummary({
    scores: normalizedScores,
    state_label: stateLabel,
    decision,
    active_signals: activeSignals,
    active_constraints: activeConstraints,
  });

  return {
    context: payload.context,
    scores: normalizedScores,
    decision,
    state_label: stateLabel,
    active_signals: activeSignals,
    active_constraints: activeConstraints,
    executive_summary: executiveSummary,
    created_at: new Date().toISOString(),
  };
}
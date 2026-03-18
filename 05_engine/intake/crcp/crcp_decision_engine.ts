import { CrcpBaselineScores } from "../../types/CrcpBaselineScores";
import { CrcpDecision } from "../../types/CrcpDecision";

function computeReadinessLevel(scores: CrcpBaselineScores): "low" | "medium" | "high" {
  const values = [
    scores.operational_maturity,
    scores.financial_pressure,
    scores.reporting_reliability,
    scores.structural_risk,
    scores.commercial_strength,
  ];

  const average =
    values.reduce((sum, value) => sum + value, 0) / values.length;

  if (average < 40) {
    return "low";
  }

  if (average < 70) {
    return "medium";
  }

  return "high";
}

export function computeCrcpDecision(
  scores: CrcpBaselineScores
): CrcpDecision {
  const readinessLevel = computeReadinessLevel(scores);

  if (scores.reporting_reliability < 40) {
    return {
      decision_label: "stabilize_now",
      priority: "P1",
      readiness_level: readinessLevel,
    };
  }

  if (scores.structural_risk < 45) {
    return {
      decision_label: "contain_risk",
      priority: "P1",
      readiness_level: readinessLevel,
    };
  }

  if (scores.operational_maturity < 55) {
    return {
      decision_label: "standardize_operations",
      priority: "P2",
      readiness_level: readinessLevel,
    };
  }

  return {
    decision_label: "optimize_growth",
    priority: "P3",
    readiness_level: readinessLevel,
  };
}
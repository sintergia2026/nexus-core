import { CrcpBaselineScores } from "../../types/CrcpBaselineScores";
import { CrcpDecision } from "../../types/CrcpDecision";

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function normalizeScores(scores: CrcpBaselineScores): CrcpBaselineScores {
  return {
    operational_maturity: clampScore(scores.operational_maturity),
    financial_pressure: clampScore(scores.financial_pressure),
    reporting_reliability: clampScore(scores.reporting_reliability),
    structural_risk: clampScore(scores.structural_risk),
    commercial_strength: clampScore(scores.commercial_strength),
  };
}

function computeAverage(scores: CrcpBaselineScores): number {
  const values = [
    scores.operational_maturity,
    scores.financial_pressure,
    scores.reporting_reliability,
    scores.structural_risk,
    scores.commercial_strength,
  ];

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function computeMinimum(scores: CrcpBaselineScores): number {
  return Math.min(
    scores.operational_maturity,
    scores.financial_pressure,
    scores.reporting_reliability,
    scores.structural_risk,
    scores.commercial_strength
  );
}

function computeReadinessLevel(
  scores: CrcpBaselineScores
): "low" | "medium" | "high" {
  const average = computeAverage(scores);
  const minimum = computeMinimum(scores);

  if (average < 40 || minimum < 30) {
    return "low";
  }

  if (average < 70 || minimum < 55) {
    return "medium";
  }

  return "high";
}

export function computeCrcpDecision(
  scores: CrcpBaselineScores
): CrcpDecision {
  const normalizedScores = normalizeScores(scores);

  const operationalMaturity = normalizedScores.operational_maturity;
  const financialPressure = normalizedScores.financial_pressure;
  const reportingReliability = normalizedScores.reporting_reliability;
  const structuralRisk = normalizedScores.structural_risk;
  const commercialStrength = normalizedScores.commercial_strength;

  const readinessLevel = computeReadinessLevel(normalizedScores);

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
    return {
      decision_label: "stabilize_now",
      priority: "P1",
      readiness_level: readinessLevel,
    };
  }

  const operationalFragility =
    operationalMaturity < 45 || structuralRisk < 50;

  const financialFragility =
    financialPressure < 45 ||
    (financialPressure < 55 && commercialStrength < 45);

  const commercialFragility = commercialStrength < 40;

  if (operationalFragility || financialFragility || commercialFragility) {
    return {
      decision_label: "contain_risk",
      priority: "P1",
      readiness_level: readinessLevel,
    };
  }

  const standardizationRequired =
    operationalMaturity < 65 ||
    reportingReliability < 60 ||
    structuralRisk < 60 ||
    financialPressure < 60;

  if (standardizationRequired) {
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
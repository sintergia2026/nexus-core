import { CrcpBaselineScores } from "../../types/CrcpBaselineScores";
import {
  CrcpNormalizedPayload,
  NormalizedMetric,
} from "../../types/CrcpNormalizedPayload";

interface WeightedAverageInput {
  domains: string[];
  metrics: NormalizedMetric[];
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function weightedAverageByDomains({
  domains,
  metrics,
}: WeightedAverageInput): number {
  const filtered = metrics.filter((metric) => domains.includes(metric.domain));

  if (filtered.length === 0) {
    return 0;
  }

  const weightedSum = filtered.reduce(
    (sum, metric) => sum + metric.normalized_value * metric.weight,
    0
  );

  const totalWeight = filtered.reduce((sum, metric) => sum + metric.weight, 0);

  if (totalWeight === 0) {
    return 0;
  }

  return roundToTwo(weightedSum / totalWeight);
}

export function computeCrcpBaselineScores(
  normalized: CrcpNormalizedPayload
): CrcpBaselineScores {
  const metrics = normalized.metrics;

  const operationalMaturity = weightedAverageByDomains({
    domains: ["operations", "staffing", "planning"],
    metrics,
  });

  const financialPressure = weightedAverageByDomains({
    domains: ["finance", "inventory", "sales"],
    metrics,
  });

  const reportingReliability = weightedAverageByDomains({
    domains: ["reporting"],
    metrics,
  });

  const structuralRisk = weightedAverageByDomains({
    domains: ["operations", "staffing", "customer_flow", "reporting"],
    metrics,
  });

  const commercialStrength = weightedAverageByDomains({
    domains: ["sales", "customer_flow"],
    metrics,
  });

  return {
    operational_maturity: operationalMaturity,
    financial_pressure: financialPressure,
    reporting_reliability: reportingReliability,
    structural_risk: structuralRisk,
    commercial_strength: commercialStrength,
  };
}
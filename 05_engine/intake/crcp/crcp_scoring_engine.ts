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

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function isUsableMetric(metric: NormalizedMetric): boolean {
  return (
    metric !== null &&
    typeof metric === "object" &&
    typeof metric.domain === "string" &&
    metric.domain.trim().length > 0 &&
    typeof metric.weight === "number" &&
    Number.isFinite(metric.weight) &&
    metric.weight > 0 &&
    typeof metric.normalized_value === "number" &&
    Number.isFinite(metric.normalized_value)
  );
}

function weightedAverageByDomains({
  domains,
  metrics,
}: WeightedAverageInput): number {
  const domainSet = new Set(
    domains
      .filter((domain) => typeof domain === "string")
      .map((domain) => domain.trim())
      .filter(Boolean)
  );

  if (domainSet.size === 0) {
    return 0;
  }

  const filtered = metrics.filter(
    (metric) => isUsableMetric(metric) && domainSet.has(metric.domain)
  );

  if (filtered.length === 0) {
    return 0;
  }

  const weightedSum = filtered.reduce((sum, metric) => {
    return sum + clampScore(metric.normalized_value) * metric.weight;
  }, 0);

  const totalWeight = filtered.reduce((sum, metric) => {
    return sum + metric.weight;
  }, 0);

  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    return 0;
  }

  return roundToTwo(clampScore(weightedSum / totalWeight));
}

export function computeCrcpBaselineScores(
  normalized: CrcpNormalizedPayload
): CrcpBaselineScores {
  const metrics = Array.isArray(normalized.metrics) ? normalized.metrics : [];

  const operationalMaturity = weightedAverageByDomains({
    domains: ["operations", "staffing", "planning"],
    metrics,
  });

  /**
   * NOTE:
   * This score is currently named "financial_pressure" for compatibility
   * with the existing CRCP contracts, but operationally it behaves as a
   * positive-control score:
   *
   * - high score = stronger financial control under pressure
   * - low score = weaker financial control / higher effective fragility
   *
   * Downstream engines must therefore interpret LOW values as bad.
   */
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
import {
  MetricCode,
  MetricValue,
} from "../../02_contracts/MetricDefinition";
import { NormalizedOperationalIntakePayload } from "../normalization/normalization_engine";

export interface MetricsComputationResult {
  computedAt: string;
  sourcePayloadId: string;
  metrics: MetricValue[];
}

function roundTo(value: number, decimals = 4): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function safeDivide(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function createMetric(
  code: MetricCode,
  value: number,
  unit: string,
  computedAt: string,
  sourcePayloadId: string,
  confidence: number
): MetricValue {
  return {
    code,
    value: roundTo(value, 4),
    unit,
    computedAt,
    sourcePayloadId,
    confidence: roundTo(confidence, 4),
  };
}

function computeThroughput(
  payload: NormalizedOperationalIntakePayload,
  computedAt: string
): MetricValue {
  return createMetric(
    "throughput",
    payload.throughput.unitsCompleted,
    "units/week",
    computedAt,
    payload.payloadId,
    1
  );
}

function computeUtilization(
  payload: NormalizedOperationalIntakePayload,
  computedAt: string
): MetricValue {
  const utilization = safeDivide(
    payload.staffing.workedHours,
    payload.staffing.scheduledHours
  );

  return createMetric(
    "utilization",
    utilization,
    "ratio",
    computedAt,
    payload.payloadId,
    0.9
  );
}

function computeLatency(
  payload: NormalizedOperationalIntakePayload,
  computedAt: string
): MetricValue {
  return createMetric(
    "latency",
    payload.time.avgCycleTimeMinutes,
    "minutes",
    computedAt,
    payload.payloadId,
    0.95
  );
}

function computeRevenueLeakage(
  payload: NormalizedOperationalIntakePayload,
  computedAt: string
): MetricValue {
  const leakage =
    payload.revenue.estimatedLeakage ??
    Math.max(payload.revenue.grossRevenue - payload.revenue.capturedRevenue, 0);

  return createMetric(
    "revenue_leakage",
    leakage,
    payload.revenue.currency,
    computedAt,
    payload.payloadId,
    0.9
  );
}

function computeStaffingPressure(
  payload: NormalizedOperationalIntakePayload,
  computedAt: string
): MetricValue {
  const hoursCoverageRatio = safeDivide(
    payload.staffing.workedHours,
    payload.staffing.scheduledHours
  );

  const headcountCoverageRatio = safeDivide(
    payload.staffing.headcountActual,
    payload.staffing.headcountScheduled
  );

  const demandPressureRatio = safeDivide(
    payload.demand.peakDemandUnits ?? payload.demand.demandUnits,
    payload.demand.demandUnits || 1
  );

  const hoursShortfall = clamp(1 - hoursCoverageRatio, 0, 1);
  const headcountShortfall = clamp(1 - headcountCoverageRatio, 0, 1);
  const demandExcess = clamp(demandPressureRatio - 1, 0, 2);

  const pressureScore =
    hoursShortfall * 35 +
    headcountShortfall * 35 +
    demandExcess * 15;

  const boundedPressure = clamp(pressureScore, 0, 100);

  return createMetric(
    "staffing_pressure",
    boundedPressure,
    "score_0_100",
    computedAt,
    payload.payloadId,
    0.86
  );
}

function computeReportingReliability(
  payload: NormalizedOperationalIntakePayload,
  computedAt: string
): MetricValue {
  const submissionRatio = safeDivide(
    payload.reporting.submittedReports,
    payload.reporting.expectedReports || 1
  );

  const missingFieldPenalty = Math.min(payload.reporting.missingFieldsCount * 0.02, 0.5);
  const latenessPenalty = Math.min(payload.reporting.lateSubmissionsCount * 0.05, 0.5);

  const sourceScore =
    payload.reporting.sourceReliabilityScore !== undefined
      ? payload.reporting.sourceReliabilityScore / 100
      : 0.85;

  const rawScore =
    submissionRatio * 0.5 +
    sourceScore * 0.35 +
    Math.max(1 - missingFieldPenalty - latenessPenalty, 0) * 0.15;

  const boundedScore = Math.max(0, Math.min(rawScore, 1)) * 100;

  return createMetric(
    "reporting_reliability",
    boundedScore,
    "score_0_100",
    computedAt,
    payload.payloadId,
    0.88
  );
}

export function computePhase1Metrics(
  payload: NormalizedOperationalIntakePayload
): MetricsComputationResult {
  const computedAt = new Date().toISOString();

  const metrics: MetricValue[] = [
    computeThroughput(payload, computedAt),
    computeUtilization(payload, computedAt),
    computeLatency(payload, computedAt),
    computeRevenueLeakage(payload, computedAt),
    computeStaffingPressure(payload, computedAt),
    computeReportingReliability(payload, computedAt),
  ];

  return {
    computedAt,
    sourcePayloadId: payload.payloadId,
    metrics,
  };
}

export function getMetricByCode(
  metrics: MetricValue[],
  code: MetricCode
): MetricValue | undefined {
  return metrics.find((metric) => metric.code === code);
}

export function assertPhase1MetricsComplete(metrics: MetricValue[]): boolean {
  const requiredCodes: MetricCode[] = [
    "throughput",
    "utilization",
    "latency",
    "revenue_leakage",
    "staffing_pressure",
    "reporting_reliability",
  ];

  return requiredCodes.every((code) =>
    metrics.some((metric) => metric.code === code)
  );
}
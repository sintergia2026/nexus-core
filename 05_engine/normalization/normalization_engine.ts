import {
  OperationalIntakePayload,
  OperationalIntakeValidationResult,
} from "../../02_contracts/OperationalIntakePayload";
import { validateOperationalIntakePayload } from "./normalization_rules";

export interface NormalizedOperationalIntakePayload
  extends OperationalIntakePayload {
  normalizationMeta: {
    normalizedAt: string;
    warnings: string[];
    sourceValidation: OperationalIntakeValidationResult;
  };
}

function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function normalizeText(value: string | undefined | null): string {
  return (value ?? "").trim();
}

function normalizeStringArray(values?: string[]): string[] {
  return (values ?? []).map((v) => v.trim()).filter(Boolean);
}

export function normalizeOperationalIntakePayload(
  payload: OperationalIntakePayload
): NormalizedOperationalIntakePayload {
  const validation = validateOperationalIntakePayload(payload);

  if (!validation.valid) {
    throw new Error(
      `Operational intake payload is invalid: ${validation.errors.join(" | ")}`
    );
  }

  const normalizedAt = new Date().toISOString();

  const estimatedLeakage =
    payload.revenue.estimatedLeakage ??
    Math.max(payload.revenue.grossRevenue - payload.revenue.capturedRevenue, 0);

  const normalized: NormalizedOperationalIntakePayload = {
    ...payload,

    payloadId: normalizeText(payload.payloadId),
    capturedAt: normalizeText(payload.capturedAt),
    source: normalizeText(payload.source),
    sectorType: payload.sectorType,

    organizationId: normalizeText(payload.organizationId),
    organizationName: normalizeText(payload.organizationName),
    siteId: normalizeText(payload.siteId),
    siteName: normalizeText(payload.siteName),

    operationalWeek: {
      ...payload.operationalWeek,
      weekId: normalizeText(payload.operationalWeek.weekId),
      weekStart: normalizeText(payload.operationalWeek.weekStart),
      weekEnd: normalizeText(payload.operationalWeek.weekEnd),
      timezone: normalizeText(payload.operationalWeek.timezone),
    },

    throughput: {
      unitsCompleted: roundTo(payload.throughput.unitsCompleted, 2),
      unitLabel: normalizeText(payload.throughput.unitLabel),
    },

    revenue: {
      grossRevenue: roundTo(payload.revenue.grossRevenue, 2),
      capturedRevenue: roundTo(payload.revenue.capturedRevenue, 2),
      estimatedLeakage: roundTo(estimatedLeakage, 2),
      currency: normalizeText(payload.revenue.currency).toUpperCase(),
    },

    staffing: {
      scheduledHours: roundTo(payload.staffing.scheduledHours, 2),
      workedHours: roundTo(payload.staffing.workedHours, 2),
      headcountScheduled: roundTo(payload.staffing.headcountScheduled, 2),
      headcountActual: roundTo(payload.staffing.headcountActual, 2),
    },

    time: {
      avgCycleTimeMinutes: roundTo(payload.time.avgCycleTimeMinutes, 2),
      avgWaitTimeMinutes:
        payload.time.avgWaitTimeMinutes !== undefined
          ? roundTo(payload.time.avgWaitTimeMinutes, 2)
          : undefined,
      avgServiceTimeMinutes:
        payload.time.avgServiceTimeMinutes !== undefined
          ? roundTo(payload.time.avgServiceTimeMinutes, 2)
          : undefined,
    },

    demand: {
      demandUnits: roundTo(payload.demand.demandUnits, 2),
      peakDemandUnits:
        payload.demand.peakDemandUnits !== undefined
          ? roundTo(payload.demand.peakDemandUnits, 2)
          : undefined,
      volatilityIndex:
        payload.demand.volatilityIndex !== undefined
          ? roundTo(payload.demand.volatilityIndex, 4)
          : undefined,
    },

    reporting: {
      expectedReports: roundTo(payload.reporting.expectedReports, 2),
      submittedReports: roundTo(payload.reporting.submittedReports, 2),
      missingFieldsCount: roundTo(payload.reporting.missingFieldsCount, 2),
      lateSubmissionsCount: roundTo(payload.reporting.lateSubmissionsCount, 2),
      sourceReliabilityScore:
        payload.reporting.sourceReliabilityScore !== undefined
          ? roundTo(payload.reporting.sourceReliabilityScore, 2)
          : undefined,
    },

    notes: normalizeStringArray(payload.notes),
    tags: normalizeStringArray(payload.tags),

    submittedBy: payload.submittedBy
      ? {
          actorId: normalizeText(payload.submittedBy.actorId),
          actorName: normalizeText(payload.submittedBy.actorName),
          actorRole: normalizeText(payload.submittedBy.actorRole),
        }
      : undefined,

    normalizationMeta: {
      normalizedAt,
      warnings: validation.warnings,
      sourceValidation: validation,
    },
  };

  return normalized;
}
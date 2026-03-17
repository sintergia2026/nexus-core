import {
  OperationalIntakePayload,
  OperationalIntakeValidationResult,
} from "../../02_contracts/OperationalIntakePayload";

export interface NormalizationRuleResult {
  errors: string[];
  warnings: string[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateNonNegative(
  label: string,
  value: unknown,
  errors: string[]
): void {
  if (!isFiniteNumber(value)) {
    errors.push(`${label} must be a finite number.`);
    return;
  }

  if (value < 0) {
    errors.push(`${label} cannot be negative.`);
  }
}

export function validateOperationalIntakePayload(
  payload: OperationalIntakePayload
): OperationalIntakeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!payload.payloadId?.trim()) errors.push("payloadId is required.");
  if (!payload.capturedAt?.trim()) errors.push("capturedAt is required.");
  if (!payload.source?.trim()) errors.push("source is required.");
  if (!payload.organizationId?.trim()) errors.push("organizationId is required.");
  if (!payload.organizationName?.trim()) warnings.push("organizationName is empty.");
  if (!payload.siteId?.trim()) errors.push("siteId is required.");
  if (!payload.siteName?.trim()) warnings.push("siteName is empty.");

  if (!payload.operationalWeek?.weekId?.trim()) {
    errors.push("operationalWeek.weekId is required.");
  }
  if (!payload.operationalWeek?.weekStart?.trim()) {
    errors.push("operationalWeek.weekStart is required.");
  }
  if (!payload.operationalWeek?.weekEnd?.trim()) {
    errors.push("operationalWeek.weekEnd is required.");
  }
  if (!payload.operationalWeek?.timezone?.trim()) {
    warnings.push("operationalWeek.timezone is empty.");
  }

  validateNonNegative("throughput.unitsCompleted", payload.throughput?.unitsCompleted, errors);
  if (!payload.throughput?.unitLabel?.trim()) {
    warnings.push("throughput.unitLabel is empty.");
  }

  validateNonNegative("revenue.grossRevenue", payload.revenue?.grossRevenue, errors);
  validateNonNegative("revenue.capturedRevenue", payload.revenue?.capturedRevenue, errors);
  if (
    payload.revenue?.estimatedLeakage !== undefined &&
    payload.revenue?.estimatedLeakage !== null
  ) {
    validateNonNegative("revenue.estimatedLeakage", payload.revenue.estimatedLeakage, errors);
  }
  if (!payload.revenue?.currency?.trim()) {
    warnings.push("revenue.currency is empty.");
  }

  validateNonNegative("staffing.scheduledHours", payload.staffing?.scheduledHours, errors);
  validateNonNegative("staffing.workedHours", payload.staffing?.workedHours, errors);
  validateNonNegative(
    "staffing.headcountScheduled",
    payload.staffing?.headcountScheduled,
    errors
  );
  validateNonNegative("staffing.headcountActual", payload.staffing?.headcountActual, errors);

  validateNonNegative("time.avgCycleTimeMinutes", payload.time?.avgCycleTimeMinutes, errors);
  if (
    payload.time?.avgWaitTimeMinutes !== undefined &&
    payload.time?.avgWaitTimeMinutes !== null
  ) {
    validateNonNegative("time.avgWaitTimeMinutes", payload.time.avgWaitTimeMinutes, errors);
  }
  if (
    payload.time?.avgServiceTimeMinutes !== undefined &&
    payload.time?.avgServiceTimeMinutes !== null
  ) {
    validateNonNegative("time.avgServiceTimeMinutes", payload.time.avgServiceTimeMinutes, errors);
  }

  validateNonNegative("demand.demandUnits", payload.demand?.demandUnits, errors);
  if (
    payload.demand?.peakDemandUnits !== undefined &&
    payload.demand?.peakDemandUnits !== null
  ) {
    validateNonNegative("demand.peakDemandUnits", payload.demand.peakDemandUnits, errors);
  }
  if (
    payload.demand?.volatilityIndex !== undefined &&
    payload.demand?.volatilityIndex !== null &&
    !isFiniteNumber(payload.demand.volatilityIndex)
  ) {
    errors.push("demand.volatilityIndex must be a finite number.");
  }

  validateNonNegative("reporting.expectedReports", payload.reporting?.expectedReports, errors);
  validateNonNegative("reporting.submittedReports", payload.reporting?.submittedReports, errors);
  validateNonNegative("reporting.missingFieldsCount", payload.reporting?.missingFieldsCount, errors);
  validateNonNegative(
    "reporting.lateSubmissionsCount",
    payload.reporting?.lateSubmissionsCount,
    errors
  );

  if (
    payload.reporting?.sourceReliabilityScore !== undefined &&
    payload.reporting?.sourceReliabilityScore !== null
  ) {
    if (!isFiniteNumber(payload.reporting.sourceReliabilityScore)) {
      errors.push("reporting.sourceReliabilityScore must be a finite number.");
    } else if (
      payload.reporting.sourceReliabilityScore < 0 ||
      payload.reporting.sourceReliabilityScore > 100
    ) {
      errors.push("reporting.sourceReliabilityScore must be between 0 and 100.");
    }
  }

  if (
    isFiniteNumber(payload.revenue?.capturedRevenue) &&
    isFiniteNumber(payload.revenue?.grossRevenue) &&
    payload.revenue.capturedRevenue > payload.revenue.grossRevenue
  ) {
    warnings.push("revenue.capturedRevenue is greater than revenue.grossRevenue.");
  }

  if (
    isFiniteNumber(payload.reporting?.submittedReports) &&
    isFiniteNumber(payload.reporting?.expectedReports) &&
    payload.reporting.submittedReports > payload.reporting.expectedReports
  ) {
    warnings.push("reporting.submittedReports is greater than reporting.expectedReports.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}


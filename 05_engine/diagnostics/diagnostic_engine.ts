import { MetricCode, MetricValue } from "../../02_contracts/MetricDefinition";
import {
  SignalCode,
  SignalInstance,
  SignalSeverity,
} from "../../02_contracts/SignalDefinition";
import { NormalizedOperationalIntakePayload } from "../normalization/normalization_engine";
import { MetricsComputationResult, getMetricByCode } from "../metrics/metrics_engine";
import { TwinConstraint, TwinDecisionOutput, TwinHealthState } from "../../04_twin/types/TwinState";

export interface DiagnosticsComputationResult {
  generatedAt: string;
  stateLabel: TwinHealthState;
  signals: SignalInstance[];
  constraints: TwinConstraint[];
  diagnosticSummary: string;
  decisionOutput: TwinDecisionOutput;
}

function severityRank(severity: SignalSeverity): number {
  switch (severity) {
    case "LOW":
      return 1;
    case "MEDIUM":
      return 2;
    case "HIGH":
      return 3;
    case "CRITICAL":
      return 4;
    default:
      return 0;
  }
}

function rankToSeverity(rank: number): SignalSeverity {
  if (rank >= 4) return "CRITICAL";
  if (rank === 3) return "HIGH";
  if (rank === 2) return "MEDIUM";
  return "LOW";
}

function minSeverity(
  severity: SignalSeverity,
  cap: SignalSeverity
): SignalSeverity {
  return rankToSeverity(
    Math.min(severityRank(severity), severityRank(cap))
  );
}

function createSignal(
  code: SignalCode,
  active: boolean,
  severity: SignalSeverity,
  message: string,
  evidence: string[],
  relatedMetricCodes: MetricCode[],
  generatedAt: string
): SignalInstance {
  return {
    code,
    active,
    severity,
    message,
    evidence,
    relatedMetricCodes,
    generatedAt,
  };
}

function detectLatencySignal(
  latencyMetric: MetricValue | undefined,
  generatedAt: string
): SignalInstance {
  const value = latencyMetric?.value ?? 0;

  if (value >= 60) {
    return createSignal(
      "latency_signal",
      true,
      "CRITICAL",
      "Average cycle time is critically elevated.",
      [`latency=${value} minutes`],
      ["latency"],
      generatedAt
    );
  }

  if (value >= 35) {
    return createSignal(
      "latency_signal",
      true,
      "HIGH",
      "Average cycle time is above healthy flow range.",
      [`latency=${value} minutes`],
      ["latency"],
      generatedAt
    );
  }

  if (value >= 20) {
    return createSignal(
      "latency_signal",
      true,
      "MEDIUM",
      "Average cycle time shows moderate delay.",
      [`latency=${value} minutes`],
      ["latency"],
      generatedAt
    );
  }

  return createSignal(
    "latency_signal",
    false,
    "LOW",
    "Latency is within expected operating range.",
    [`latency=${value} minutes`],
    ["latency"],
    generatedAt
  );
}

function detectLeakageSignal(
  leakageMetric: MetricValue | undefined,
  revenueCurrency: string,
  generatedAt: string
): SignalInstance {
  const value = leakageMetric?.value ?? 0;

  if (value >= 1000) {
    return createSignal(
      "leakage_signal",
      true,
      "CRITICAL",
      "Revenue leakage is critically high.",
      [`revenue_leakage=${value} ${revenueCurrency}`],
      ["revenue_leakage"],
      generatedAt
    );
  }

  if (value >= 500) {
    return createSignal(
      "leakage_signal",
      true,
      "HIGH",
      "Revenue leakage is materially high.",
      [`revenue_leakage=${value} ${revenueCurrency}`],
      ["revenue_leakage"],
      generatedAt
    );
  }

  if (value >= 150) {
    return createSignal(
      "leakage_signal",
      true,
      "MEDIUM",
      "Revenue leakage is present and should be investigated.",
      [`revenue_leakage=${value} ${revenueCurrency}`],
      ["revenue_leakage"],
      generatedAt
    );
  }

  return createSignal(
    "leakage_signal",
    false,
    "LOW",
    "Revenue leakage remains within acceptable range.",
    [`revenue_leakage=${value} ${revenueCurrency}`],
    ["revenue_leakage"],
    generatedAt
  );
}

function detectVolatilitySignal(
  payload: NormalizedOperationalIntakePayload,
  generatedAt: string
): SignalInstance {
  const explicitVolatility = payload.demand.volatilityIndex ?? 0;
  const peak = payload.demand.peakDemandUnits ?? payload.demand.demandUnits;
  const baseline = payload.demand.demandUnits || 1;
  const peakRatio = peak / baseline;

  const effectiveVolatility = explicitVolatility > 0 ? explicitVolatility : peakRatio - 1;

  if (effectiveVolatility >= 1) {
    return createSignal(
      "volatility_signal",
      true,
      "HIGH",
      "Demand volatility is significantly elevated.",
      [
        `volatility_index=${effectiveVolatility}`,
        `peak_to_baseline_ratio=${peakRatio}`,
      ],
      [],
      generatedAt
    );
  }

  if (effectiveVolatility >= 0.35) {
    return createSignal(
      "volatility_signal",
      true,
      "MEDIUM",
      "Demand volatility is moderate.",
      [
        `volatility_index=${effectiveVolatility}`,
        `peak_to_baseline_ratio=${peakRatio}`,
      ],
      [],
      generatedAt
    );
  }

  return createSignal(
    "volatility_signal",
    false,
    "LOW",
    "Demand volatility is within acceptable range.",
    [
      `volatility_index=${effectiveVolatility}`,
      `peak_to_baseline_ratio=${peakRatio}`,
    ],
    [],
    generatedAt
  );
}

function detectStaffingPressureSignal(
  staffingPressureMetric: MetricValue | undefined,
  generatedAt: string
): SignalInstance {
  const value = staffingPressureMetric?.value ?? 0;

  if (value >= 75) {
    return createSignal(
      "staffing_pressure_signal",
      true,
      "CRITICAL",
      "Staffing pressure is critically high.",
      [`staffing_pressure=${value}`],
      ["staffing_pressure"],
      generatedAt
    );
  }

  if (value >= 50) {
    return createSignal(
      "staffing_pressure_signal",
      true,
      "HIGH",
      "Staffing pressure is high.",
      [`staffing_pressure=${value}`],
      ["staffing_pressure"],
      generatedAt
    );
  }

  if (value >= 25) {
    return createSignal(
      "staffing_pressure_signal",
      true,
      "MEDIUM",
      "Staffing pressure is emerging.",
      [`staffing_pressure=${value}`],
      ["staffing_pressure"],
      generatedAt
    );
  }

  return createSignal(
    "staffing_pressure_signal",
    false,
    "LOW",
    "Staffing pressure is within acceptable range.",
    [`staffing_pressure=${value}`],
    ["staffing_pressure"],
    generatedAt
  );
}

function detectReportingGapSignal(
  reportingReliabilityMetric: MetricValue | undefined,
  generatedAt: string
): SignalInstance {
  const value = reportingReliabilityMetric?.value ?? 100;

  if (value < 40) {
    return createSignal(
      "reporting_gap_signal",
      true,
      "CRITICAL",
      "Reporting reliability is critically low.",
      [`reporting_reliability=${value}`],
      ["reporting_reliability"],
      generatedAt
    );
  }

  if (value < 65) {
    return createSignal(
      "reporting_gap_signal",
      true,
      "HIGH",
      "Reporting reliability is weak.",
      [`reporting_reliability=${value}`],
      ["reporting_reliability"],
      generatedAt
    );
  }

  if (value < 80) {
    return createSignal(
      "reporting_gap_signal",
      true,
      "MEDIUM",
      "Reporting reliability is below target.",
      [`reporting_reliability=${value}`],
      ["reporting_reliability"],
      generatedAt
    );
  }

  return createSignal(
    "reporting_gap_signal",
    false,
    "LOW",
    "Reporting reliability is acceptable.",
    [`reporting_reliability=${value}`],
    ["reporting_reliability"],
    generatedAt
  );
}

function detectConstraintSignal(
  activeConstraints: TwinConstraint[],
  generatedAt: string
): SignalInstance {
  if (activeConstraints.some((constraint) => constraint.active)) {
    const highestSeverity = activeConstraints
      .filter((constraint) => constraint.active)
      .sort((a, b) => {
        const aRank =
          a.severity === "CRITICAL" ? 4 :
          a.severity === "HIGH" ? 3 :
          a.severity === "MEDIUM" ? 2 : 1;
        const bRank =
          b.severity === "CRITICAL" ? 4 :
          b.severity === "HIGH" ? 3 :
          b.severity === "MEDIUM" ? 2 : 1;
        return bRank - aRank;
      })[0];

    return createSignal(
      "constraint_signal",
      true,
      highestSeverity?.severity ?? "MEDIUM",
      "Structural constraints are affecting operational performance.",
      activeConstraints
        .filter((constraint) => constraint.active)
        .map((constraint) => `${constraint.code}:${constraint.severity}`),
      [],
      generatedAt
    );
  }

  return createSignal(
    "constraint_signal",
    false,
    "LOW",
    "No major structural constraints detected.",
    [],
    [],
    generatedAt
  );
}

function deriveConstraints(
  latencySignal: SignalInstance,
  staffingSignal: SignalInstance,
  reportingSignal: SignalInstance,
  leakageSignal: SignalInstance
): TwinConstraint[] {
  const isolatedCriticalLeakage =
    leakageSignal.active &&
    leakageSignal.severity === "CRITICAL" &&
    !latencySignal.active;

  const coordinationFromLeakageAndLatency =
    leakageSignal.active && latencySignal.active;

  let coordinationActive = false;
  let coordinationSeverity: SignalSeverity = "LOW";
  let coordinationDescription = "No material coordination constraint detected.";

  if (isolatedCriticalLeakage) {
    coordinationActive = true;
    coordinationSeverity = "MEDIUM";
    coordinationDescription =
      "Control/coordination constraint inferred from isolated critical revenue leakage.";
  } else if (coordinationFromLeakageAndLatency) {
    coordinationActive = true;
    const combinedSeverity =
      severityRank(leakageSignal.severity) >= severityRank(latencySignal.severity)
        ? leakageSignal.severity
        : latencySignal.severity;

    coordinationSeverity = minSeverity(combinedSeverity, "HIGH");
    coordinationDescription =
      "Coordination constraint inferred from simultaneous leakage and latency.";
  }

  const constraints: TwinConstraint[] = [
    {
      code: "flow",
      active: latencySignal.active,
      severity: latencySignal.severity,
      description: latencySignal.active
        ? "Flow constraint driven by elevated latency."
        : "No material flow constraint detected.",
    },
    {
      code: "capacity",
      active: staffingSignal.active,
      severity: staffingSignal.severity,
      description: staffingSignal.active
        ? "Capacity constraint driven by staffing pressure."
        : "No material capacity constraint detected.",
    },
    {
      code: "reporting",
      active: reportingSignal.active,
      severity: reportingSignal.severity,
      description: reportingSignal.active
        ? "Reporting constraint driven by weak reporting reliability."
        : "No material reporting constraint detected.",
    },
    {
      code: "coordination",
      active: coordinationActive,
      severity: coordinationSeverity,
      description: coordinationDescription,
    },
  ];

  return constraints;
}

function deriveStateLabel(
  signals: SignalInstance[],
  constraints: TwinConstraint[]
): TwinHealthState {
  const activeSignals = signals.filter((signal) => signal.active);
  const activeConstraints = constraints.filter((constraint) => constraint.active);

  const criticalCount = activeSignals.filter(
    (signal) => signal.severity === "CRITICAL"
  ).length;
  const highCount = activeSignals.filter(
    (signal) => signal.severity === "HIGH"
  ).length;

  const activeConstraintCount = activeConstraints.length;

  const leakageSignal = signals.find((signal) => signal.code === "leakage_signal");
  const latencySignal = signals.find((signal) => signal.code === "latency_signal");
  const coordinationConstraint = constraints.find(
    (constraint) => constraint.code === "coordination" && constraint.active
  );

  const criticalLeakageActive =
    leakageSignal?.active === true && leakageSignal.severity === "CRITICAL";

  const latencyActive = latencySignal?.active === true;

  const isolatedEconomicStress =
    criticalLeakageActive &&
    !latencyActive &&
    activeConstraintCount === 1 &&
    coordinationConstraint?.severity === "MEDIUM";

  const economicStressWithMildFriction =
    criticalLeakageActive &&
    latencyActive &&
    activeConstraintCount === 2 &&
    constraints.some(
      (constraint) =>
        constraint.code === "flow" &&
        constraint.active &&
        constraint.severity === "MEDIUM"
    ) &&
    coordinationConstraint?.severity === "HIGH";

  if (isolatedEconomicStress) return "constrained";
  if (economicStressWithMildFriction) return "constrained";

  if (criticalCount >= 2) return "degraded";
  if (criticalCount >= 1 && highCount >= 1) return "degraded";
  if (highCount >= 2 || activeConstraintCount >= 3) return "constrained";
  if (highCount >= 1 || activeSignals.length >= 3) return "fragile";
  if (activeSignals.length === 0) return "stable";

  return "recovering";
}

function buildDiagnosticSummary(
  stateLabel: TwinHealthState,
  signals: SignalInstance[],
  constraints: TwinConstraint[]
): string {
  const activeSignals = signals.filter((signal) => signal.active);
  const activeConstraints = constraints.filter((constraint) => constraint.active);

  if (stateLabel === "stable") {
    return "Operational state is stable. No material structural or reporting disruptions detected.";
  }

  const signalLabels = activeSignals.map((signal) => signal.code).join(", ");
  const constraintLabels = activeConstraints.map((constraint) => constraint.code).join(", ");

  return `Operational state is ${stateLabel}. Active signals: ${signalLabels || "none"}. Active constraints: ${constraintLabels || "none"}.`;
}

function buildDecisionOutput(
  stateLabel: TwinHealthState,
  signals: SignalInstance[],
  constraints: TwinConstraint[]
): TwinDecisionOutput {
  const actions: string[] = [];

  const signalCodes = new Set(
    signals.filter((signal) => signal.active).map((signal) => signal.code)
  );

  if (signalCodes.has("latency_signal")) {
    actions.push("Inspect flow bottlenecks and reduce operational delay sources.");
  }
  if (signalCodes.has("leakage_signal")) {
    actions.push("Audit revenue capture points and leakage-prone handoffs.");
  }
  if (signalCodes.has("staffing_pressure_signal")) {
    actions.push("Rebalance staffing coverage against demand peaks.");
  }
  if (signalCodes.has("reporting_gap_signal")) {
    actions.push("Stabilize reporting discipline and reduce missing operational inputs.");
  }
  if (signalCodes.has("volatility_signal")) {
    actions.push("Prepare operating buffers for unstable demand conditions.");
  }

  if (constraints.some((constraint) => constraint.code === "coordination" && constraint.active)) {
    actions.push("Review cross-role coordination points and operational handoff failures.");
  }

  if (actions.length === 0) {
    actions.push("Maintain current operating discipline and continue weekly monitoring.");
  }

  if (stateLabel === "degraded") {
    return {
      decisionLabel: "stabilize_now",
      summary: "Immediate stabilization required due to severe operational degradation.",
      recommendedActions: actions,
      priority: "P1",
    };
  }

  if (stateLabel === "constrained" || stateLabel === "fragile") {
    return {
      decisionLabel: "corrective_focus",
      summary: "Targeted corrective action is required to prevent deeper operational decline.",
      recommendedActions: actions,
      priority: "P2",
    };
  }

  return {
    decisionLabel: "monitor_and_preserve",
    summary: "Maintain current performance and preserve structural stability.",
    recommendedActions: actions,
    priority: "P3",
  };
}

export function computePhase1Diagnostics(
  payload: NormalizedOperationalIntakePayload,
  metricsResult: MetricsComputationResult
): DiagnosticsComputationResult {
  const generatedAt = new Date().toISOString();

  const latencyMetric = getMetricByCode(metricsResult.metrics, "latency");
  const leakageMetric = getMetricByCode(metricsResult.metrics, "revenue_leakage");
  const staffingPressureMetric = getMetricByCode(metricsResult.metrics, "staffing_pressure");
  const reportingReliabilityMetric = getMetricByCode(
    metricsResult.metrics,
    "reporting_reliability"
  );

  const latencySignal = detectLatencySignal(latencyMetric, generatedAt);
  const leakageSignal = detectLeakageSignal(
    leakageMetric,
    payload.revenue.currency,
    generatedAt
  );
  const volatilitySignal = detectVolatilitySignal(payload, generatedAt);
  const staffingSignal = detectStaffingPressureSignal(staffingPressureMetric, generatedAt);
  const reportingSignal = detectReportingGapSignal(reportingReliabilityMetric, generatedAt);

  const constraints = deriveConstraints(
    latencySignal,
    staffingSignal,
    reportingSignal,
    leakageSignal
  );

  const constraintSignal = detectConstraintSignal(constraints, generatedAt);

  const signals: SignalInstance[] = [
    latencySignal,
    leakageSignal,
    volatilitySignal,
    staffingSignal,
    reportingSignal,
    constraintSignal,
  ];

  const stateLabel = deriveStateLabel(signals, constraints);
  const diagnosticSummary = buildDiagnosticSummary(stateLabel, signals, constraints);
  const decisionOutput = buildDecisionOutput(stateLabel, signals, constraints);

  return {
    generatedAt,
    stateLabel,
    signals,
    constraints,
    diagnosticSummary,
    decisionOutput,
  };
}
import { WeeklyReport, WeeklyReportSection } from "../../types/WeeklyReport";
import { TwinState, TwinConstraint } from "../../../04_twin/types/TwinState";
import { DiagnosticSnapshot } from "../../../04_twin/types/DiagnosticSnapshot";
import { MetricValue } from "../../../02_contracts/MetricDefinition";
import { SignalInstance } from "../../../02_contracts/SignalDefinition";

function getMetricValue(metrics: MetricValue[], code: string): number | undefined {
  return metrics.find((metric) => metric.code === code)?.value;
}

function getActiveSignals(signals: SignalInstance[]): SignalInstance[] {
  return signals.filter((signal: SignalInstance) => signal.active);
}

function buildExecutiveSummary(
  twin: TwinState,
  snapshot: DiagnosticSnapshot
): string {
  const activeSignals = getActiveSignals(snapshot.signals);
  const activeConstraints = snapshot.constraints.filter(
    (constraint: TwinConstraint) => constraint.active
  );

  if (twin.stateLabel === "stable") {
    return "The site remained operationally stable during the evaluated week, with no material structural disruptions detected.";
  }

  return `The site is currently in a ${twin.stateLabel} state. ${activeSignals.length} active signal(s) and ${activeConstraints.length} active constraint(s) were detected during the weekly diagnostic cycle.`;
}

function buildMetricOverview(metrics: MetricValue[]): string {
  const throughput = getMetricValue(metrics, "throughput");
  const utilization = getMetricValue(metrics, "utilization");
  const latency = getMetricValue(metrics, "latency");
  const leakage = getMetricValue(metrics, "revenue_leakage");
  const staffingPressure = getMetricValue(metrics, "staffing_pressure");
  const reportingReliability = getMetricValue(metrics, "reporting_reliability");

  return [
    `Throughput: ${throughput ?? "n/a"} units/week`,
    `Utilization: ${utilization ?? "n/a"} ratio`,
    `Latency: ${latency ?? "n/a"} minutes`,
    `Revenue Leakage: ${leakage ?? "n/a"}`,
    `Staffing Pressure: ${staffingPressure ?? "n/a"} / 100`,
    `Reporting Reliability: ${reportingReliability ?? "n/a"} / 100`,
  ].join(" | ");
}

function buildSignalOverview(signals: SignalInstance[]): string {
  const activeSignals = getActiveSignals(signals);

  if (activeSignals.length === 0) {
    return "No active operational warning signals were detected in the current evaluation window.";
  }

  return activeSignals
    .map(
      (signal: SignalInstance) =>
        `${signal.code} [${signal.severity}]: ${signal.message}`
    )
    .join(" | ");
}

function buildConstraintOverview(snapshot: DiagnosticSnapshot): string {
  const activeConstraints = snapshot.constraints.filter(
    (constraint: TwinConstraint) => constraint.active
  );

  if (activeConstraints.length === 0) {
    return "No active structural constraints were identified.";
  }

  return activeConstraints
    .map(
      (constraint: TwinConstraint) =>
        `${constraint.code} [${constraint.severity}]: ${constraint.description}`
    )
    .join(" | ");
}

function buildPriorityActions(twin: TwinState): string {
  if (!twin.decisionOutput.recommendedActions.length) {
    return "No priority actions generated.";
  }

  return twin.decisionOutput.recommendedActions.join(" | ");
}

function buildSections(
  twin: TwinState,
  snapshot: DiagnosticSnapshot
): WeeklyReportSection[] {
  return [
    {
      sectionCode: "executive_summary",
      title: "Executive Summary",
      content: buildExecutiveSummary(twin, snapshot),
    },
    {
      sectionCode: "metric_overview",
      title: "Metric Overview",
      content: buildMetricOverview(snapshot.metrics),
    },
    {
      sectionCode: "signal_overview",
      title: "Signal Overview",
      content: buildSignalOverview(snapshot.signals),
    },
    {
      sectionCode: "constraints",
      title: "Constraints",
      content: buildConstraintOverview(snapshot),
    },
    {
      sectionCode: "priority_actions",
      title: "Priority Actions",
      content: buildPriorityActions(twin),
    },
  ];
}

export interface BuildWeeklyReportInput {
  twin: TwinState;
  snapshot: DiagnosticSnapshot;
}

export function buildWeeklyReport(
  input: BuildWeeklyReportInput
): WeeklyReport {
  const generatedAt = new Date().toISOString();
  const sections = buildSections(input.twin, input.snapshot);

  return {
    reportId: `${input.snapshot.snapshotId}::weekly_report`,
    reportType: "weekly_report",
    generatedAt,
    unitKey: input.snapshot.unitKey,
    snapshotId: input.snapshot.snapshotId,
    twinId: input.twin.twinId,
    title: `Weekly Operational Report — ${input.snapshot.unitKey.siteId}`,
    subtitle: `${input.snapshot.unitKey.operationalWeek.weekStart} to ${input.snapshot.unitKey.operationalWeek.weekEnd}`,
    executiveSummary: buildExecutiveSummary(input.twin, input.snapshot),
    priorityActions: input.twin.decisionOutput.recommendedActions,
    sections,
    linkedSnapshot: input.snapshot,
    deliveryStatus: "draft",
    version: "1.0.0",
  };
}
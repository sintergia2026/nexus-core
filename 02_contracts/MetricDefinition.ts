export type MetricCode =
  | "throughput"
  | "utilization"
  | "latency"
  | "revenue_leakage"
  | "staffing_pressure"
  | "reporting_reliability";

export interface MetricDefinition {
  code: MetricCode;
  label: string;
  description: string;
  unit: string;
  direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER" | "BALANCED";
  requiredInPhase1: boolean;
}

export interface MetricValue {
  code: MetricCode;
  value: number;
  unit: string;
  computedAt: string; // ISO datetime
  confidence: number; // 0-1
  sourcePayloadId: string;
}

export const PHASE_1_METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    code: "throughput",
    label: "Throughput",
    description: "Volume of completed operational units during the week.",
    unit: "units/week",
    direction: "HIGHER_IS_BETTER",
    requiredInPhase1: true,
  },
  {
    code: "utilization",
    label: "Utilization",
    description: "Degree to which available operational capacity was used.",
    unit: "ratio",
    direction: "BALANCED",
    requiredInPhase1: true,
  },
  {
    code: "latency",
    label: "Latency",
    description: "Average time delay across the operational flow.",
    unit: "minutes",
    direction: "LOWER_IS_BETTER",
    requiredInPhase1: true,
  },
  {
    code: "revenue_leakage",
    label: "Revenue Leakage",
    description: "Estimated uncaptured economic value during the week.",
    unit: "currency",
    direction: "LOWER_IS_BETTER",
    requiredInPhase1: true,
  },
  {
    code: "staffing_pressure",
    label: "Staffing Pressure",
    description: "Mismatch between labor demand and staffing reality.",
    unit: "ratio",
    direction: "LOWER_IS_BETTER",
    requiredInPhase1: true,
  },
  {
    code: "reporting_reliability",
    label: "Reporting Reliability",
    description: "Quality and completeness of weekly operational reporting.",
    unit: "score_0_100",
    direction: "HIGHER_IS_BETTER",
    requiredInPhase1: true,
  },
];

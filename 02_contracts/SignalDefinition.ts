export type SignalCode =
  | "latency_signal"
  | "leakage_signal"
  | "volatility_signal"
  | "staffing_pressure_signal"
  | "reporting_gap_signal"
  | "constraint_signal";

export type SignalSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SignalDefinition {
  code: SignalCode;
  label: string;
  description: string;
  requiredInPhase1: boolean;
}

export interface SignalInstance {
  code: SignalCode;
  active: boolean;
  severity: SignalSeverity;
  message: string;
  evidence: string[];
  relatedMetricCodes?: string[];
  generatedAt: string; // ISO datetime
}

export const PHASE_1_SIGNAL_DEFINITIONS: SignalDefinition[] = [
  {
    code: "latency_signal",
    label: "Latency Signal",
    description: "Indicates operational delay beyond acceptable flow thresholds.",
    requiredInPhase1: true,
  },
  {
    code: "leakage_signal",
    label: "Leakage Signal",
    description: "Indicates economic or process value escaping capture.",
    requiredInPhase1: true,
  },
  {
    code: "volatility_signal",
    label: "Volatility Signal",
    description: "Indicates unstable demand or fluctuating operating conditions.",
    requiredInPhase1: true,
  },
  {
    code: "staffing_pressure_signal",
    label: "Staffing Pressure Signal",
    description: "Indicates labor pressure, mismatch, or overload conditions.",
    requiredInPhase1: true,
  },
  {
    code: "reporting_gap_signal",
    label: "Reporting Gap Signal",
    description: "Indicates unreliable, incomplete, or missing reporting inputs.",
    requiredInPhase1: true,
  },
  {
    code: "constraint_signal",
    label: "Constraint Signal",
    description: "Indicates structural flow, capacity, or coordination constraint.",
    requiredInPhase1: true,
  },
];
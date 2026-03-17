import { MetricValue } from "../../02_contracts/MetricDefinition";
import { SignalInstance } from "../../02_contracts/SignalDefinition";
import { OperationalUnitKey } from "../../02_contracts/OperationalWeek";

export type TwinHealthState =
  | "stable"
  | "fragile"
  | "constrained"
  | "degraded"
  | "recovering";

export interface TwinConstraint {
  code: "capacity" | "coordination" | "flow" | "reporting";
  active: boolean;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
}

export interface TwinDecisionOutput {
  decisionLabel: string;
  summary: string;
  recommendedActions: string[];
  priority: "P1" | "P2" | "P3";
}

export interface TwinState {
  twinId: string;
  unitKey: OperationalUnitKey;
  stateLabel: TwinHealthState;

  metrics: MetricValue[];
  signals: SignalInstance[];
  constraints: TwinConstraint[];

  diagnosticSummary: string;
  decisionOutput: TwinDecisionOutput;

  snapshotRef?: string;
  lastUpdatedAt: string; // ISO datetime
  lineageRef?: string;
}
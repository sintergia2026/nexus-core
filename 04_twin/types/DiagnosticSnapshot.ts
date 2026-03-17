import { MetricValue } from "../../02_contracts/MetricDefinition";
import { SignalInstance } from "../../02_contracts/SignalDefinition";
import {
  TwinConstraint,
  TwinDecisionOutput,
  TwinHealthState,
} from "./TwinState";

export interface DiagnosticSnapshotOperationalWeek {
  weekId: string;
  weekStart: string;
  weekEnd: string;
  timezone: string;
  calendarYear: number;
  weekNumber: number;
}

export interface DiagnosticSnapshotUnitKey {
  organizationId: string;
  siteId: string;
  sectorType: string;
  operationalWeek: DiagnosticSnapshotOperationalWeek;
}

export interface DiagnosticSnapshot {
  snapshotId: string;
  twinId: string;
  unitKey: DiagnosticSnapshotUnitKey;
  generatedAt: string;
  stateLabel: TwinHealthState;
  metrics: MetricValue[];
  signals: SignalInstance[];
  constraints: TwinConstraint[];
  diagnosticType: string;
  diagnosticSummary: string;
  decisionOutput: TwinDecisionOutput;
  sourcePayloadIds: string[];
  version: string;
}
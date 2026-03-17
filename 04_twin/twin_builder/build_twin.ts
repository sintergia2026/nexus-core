import { OperationalUnitKey } from "../../02_contracts/OperationalWeek";
import { MetricValue } from "../../02_contracts/MetricDefinition";
import { SignalInstance } from "../../02_contracts/SignalDefinition";
import { DiagnosticSnapshot } from "../types/DiagnosticSnapshot";
import {
  TwinConstraint,
  TwinDecisionOutput,
  TwinHealthState,
  TwinState,
} from "../types/TwinState";

export interface BuildTwinInput {
  unitKey: OperationalUnitKey;
  metrics: MetricValue[];
  signals: SignalInstance[];
  constraints: TwinConstraint[];
  stateLabel: TwinHealthState;
  diagnosticSummary: string;
  decisionOutput: TwinDecisionOutput;
  sourcePayloadIds: string[];
  version?: string;
}

function buildTwinId(unitKey: OperationalUnitKey): string {
  const paddedWeek =
    unitKey.operationalWeek.weekNumber < 10
      ? `0${unitKey.operationalWeek.weekNumber}`
      : `${unitKey.operationalWeek.weekNumber}`;

  return `${unitKey.organizationId}::${unitKey.siteId}::${unitKey.operationalWeek.calendarYear}-W${paddedWeek}`;
}

function buildSnapshotId(twinId: string): string {
  return `${twinId}::diagnostic_snapshot`;
}

function dedupePayloadIds(payloadIds: string[]): string[] {
  return Array.from(new Set(payloadIds.map((id) => id.trim()).filter(Boolean)));
}

export function buildTwinState(input: BuildTwinInput): TwinState {
  const twinId = buildTwinId(input.unitKey);
  const lastUpdatedAt = new Date().toISOString();
  const snapshotRef = buildSnapshotId(twinId);

  return {
    twinId,
    unitKey: input.unitKey,
    stateLabel: input.stateLabel,
    metrics: input.metrics,
    signals: input.signals,
    constraints: input.constraints,
    diagnosticSummary: input.diagnosticSummary,
    decisionOutput: input.decisionOutput,
    snapshotRef,
    lastUpdatedAt,
    lineageRef: undefined,
  };
}

export function buildDiagnosticSnapshot(
  input: BuildTwinInput
): DiagnosticSnapshot {
  const twinId = buildTwinId(input.unitKey);
  const snapshotId = buildSnapshotId(twinId);
  const generatedAt = new Date().toISOString();

  return {
    snapshotId,
    twinId,
    unitKey: input.unitKey,
    generatedAt,
    stateLabel: input.stateLabel,
    metrics: input.metrics,
    signals: input.signals,
    constraints: input.constraints,
    diagnosticType: "weekly_operational_diagnostic",
    diagnosticSummary: input.diagnosticSummary,
    decisionOutput: input.decisionOutput,
    sourcePayloadIds: dedupePayloadIds(input.sourcePayloadIds),
    version: input.version ?? "1.0.0",
  };
}

export interface TwinAssemblyResult {
  twin: TwinState;
  snapshot: DiagnosticSnapshot;
}

export function assembleTwinAndSnapshot(
  input: BuildTwinInput
): TwinAssemblyResult {
  const twin = buildTwinState(input);
  const snapshot = buildDiagnosticSnapshot(input);

  return {
    twin: {
      ...twin,
      snapshotRef: snapshot.snapshotId,
    },
    snapshot,
  };
}
import { OperationalIntakePayload } from "../../02_contracts/OperationalIntakePayload";
import {
  normalizeOperationalIntakePayload,
  NormalizedOperationalIntakePayload,
} from "../normalization/normalization_engine";
import { computePhase1Metrics } from "../metrics/metrics_engine";
import { computePhase1Diagnostics } from "../diagnostics/diagnostic_engine";
import { assembleTwinAndSnapshot } from "../../04_twin/twin_builder/build_twin";
import { TwinState } from "../../04_twin/types/TwinState";
import { DiagnosticSnapshot } from "../../04_twin/types/DiagnosticSnapshot";
import { MetricValue } from "../../02_contracts/MetricDefinition";
import { SignalInstance } from "../../02_contracts/SignalDefinition";

export interface RunDiagnosticResult {
  normalizedPayload: NormalizedOperationalIntakePayload;
  metrics: MetricValue[];
  signals: SignalInstance[];
  twin: TwinState;
  snapshot: DiagnosticSnapshot;
  executedAt: string;
}

export function runDiagnostic(
  payload: OperationalIntakePayload
): RunDiagnosticResult {
  const executedAt = new Date().toISOString();

  const normalizedPayload = normalizeOperationalIntakePayload(payload);

  const metricsResult = computePhase1Metrics(normalizedPayload);

  const diagnosticsResult = computePhase1Diagnostics(
    normalizedPayload,
    metricsResult
  );

  const { twin, snapshot } = assembleTwinAndSnapshot({
    unitKey: {
      organizationId: normalizedPayload.organizationId,
      siteId: normalizedPayload.siteId,
      sectorType: normalizedPayload.sectorType,
      operationalWeek: normalizedPayload.operationalWeek,
    },
    metrics: metricsResult.metrics,
    signals: diagnosticsResult.signals,
    constraints: diagnosticsResult.constraints,
    stateLabel: diagnosticsResult.stateLabel,
    diagnosticSummary: diagnosticsResult.diagnosticSummary,
    decisionOutput: diagnosticsResult.decisionOutput,
    sourcePayloadIds: [normalizedPayload.payloadId],
    version: "1.0.0",
  });

  return {
    normalizedPayload,
    metrics: metricsResult.metrics,
    signals: diagnosticsResult.signals,
    twin,
    snapshot,
    executedAt,
  };
}
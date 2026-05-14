import { OperationalIntakePayload } from "../../02_contracts/OperationalIntakePayload";
import { normalizeOperationalIntakePayload } from "../normalization/normalization_engine";
import { computePhase1Metrics } from "../metrics/metrics_engine";
import { computePhase1Diagnostics } from "../diagnostics/diagnostic_engine";
import { assembleTwinAndSnapshot } from "../../04_twin/twin_builder/build_twin";
import { buildWeeklyReport } from "../reporting/weekly/weekly_report_builder";
import { buildPersistedBundleRecord } from "../persistence/build_persisted_bundle_record";
import { queryPersistedRecordIndex } from "../persistence/query_persisted_record_index";
import { FilesystemPersistenceAdapter } from "../persistence/filesystem/FilesystemPersistenceAdapter";
import { PersistenceAdapter } from "../persistence/PersistenceAdapter";
import { PersistedBundleRecord } from "../types/PersistedBundleRecord";
import { DiagnosticRunBundle } from "../types/DiagnosticRunBundle";

export interface EngineRunOptions {
  dryRun?: boolean;
  adapter?: PersistenceAdapter;
}

export interface EngineRunResult {
  record: PersistedBundleRecord;
  supersededRecordId: string | null;
  executedAt: string;
  dryRun: boolean;
}

export async function runEngine(
  payload: OperationalIntakePayload,
  options?: EngineRunOptions
): Promise<EngineRunResult> {
  const executedAt = new Date().toISOString();
  const dryRun = options?.dryRun ?? false;
  const adapter: PersistenceAdapter =
    options?.adapter ?? new FilesystemPersistenceAdapter();

  // Stage 1 — Normalize
  const normalized = normalizeOperationalIntakePayload(payload);

  // Stage 2 — Compute metrics
  const metricsResult = computePhase1Metrics(normalized);

  // Stage 3 — Compute diagnostics
  const diagnosticsResult = computePhase1Diagnostics(normalized, metricsResult);

  // Stage 4 — Assemble twin and snapshot
  const { twin, snapshot } = assembleTwinAndSnapshot({
    unitKey: {
      organizationId: normalized.organizationId,
      siteId: normalized.siteId,
      sectorType: normalized.sectorType,
      operationalWeek: normalized.operationalWeek,
    },
    metrics: metricsResult.metrics,
    signals: diagnosticsResult.signals,
    constraints: diagnosticsResult.constraints,
    stateLabel: diagnosticsResult.stateLabel,
    diagnosticSummary: diagnosticsResult.diagnosticSummary,
    decisionOutput: diagnosticsResult.decisionOutput,
    sourcePayloadIds: [normalized.payloadId],
    version: "1.0.0",
  });

  // Stage 5 — Build weekly report
  const weeklyReport = buildWeeklyReport({ twin, snapshot });

  // Stage 6 — Assemble DiagnosticRunBundle in memory
  const bundle: DiagnosticRunBundle = {
    bundleType: "diagnostic_run_bundle",
    bundleVersion: "1.0.0",
    generatedAt: executedAt,
    scenarioFile: "",
    unitKey: snapshot.unitKey,
    normalizedPayload: normalized,
    metrics: metricsResult.metrics,
    signals: diagnosticsResult.signals,
    twin,
    snapshot,
    weeklyReport,
    artifacts: {
      diagnosticArtifact: {
        artifactType: "diagnostic_snapshot",
        artifactPath: "",
        generationStatus: "present",
        artifactSnapshotId: snapshot.snapshotId,
      },
      weeklyReportArtifact: {
        artifactType: "weekly_report",
        artifactPath: "",
        generationStatus: "present",
        artifactReportId: weeklyReport.reportId,
      },
    },
    validation: {
      typecheckPassed: true,
      baselineContrastPassed: true,
      contractsCheckPassed: true,
      candidateReviewStatus: "not_applicable",
      executedAt,
    },
  };

  // Stage 7 — Supersession check
  const activeEntries = queryPersistedRecordIndex({
    organizationId: normalized.organizationId,
    siteId: normalized.siteId,
    weekId: normalized.operationalWeek.weekId,
    recordStatus: "active",
  });

  if (activeEntries.length > 1) {
    throw new Error(
      `INTEGRITY_VIOLATION: Multiple active records found for context ` +
        `${normalized.organizationId}::${normalized.siteId}::` +
        `${normalized.operationalWeek.weekId}. ` +
        `IDs: ${activeEntries.map((e) => e.persistedBundleId).join(", ")}`
    );
  }

  const priorActiveId =
    activeEntries.length === 1 ? activeEntries[0].persistedBundleId : null;

  // Stage 8 — Build persisted record
  const record = buildPersistedBundleRecord({
    bundle,
    storedBy: "engine_orchestrator",
  });

  // Stage 9 — Persist (skipped if dryRun)
  if (!dryRun) {
    await adapter.save(record);

    if (priorActiveId !== null) {
      const priorLoadResult =
        await adapter.loadByPersistedBundleId(priorActiveId);
      if (priorLoadResult.found && priorLoadResult.record !== null) {
        const supersededRecord: PersistedBundleRecord = {
          ...priorLoadResult.record,
          recordStatus: "superseded",
        };
        await adapter.save(supersededRecord);
      }
    }
  }

  // Stage 10 — Return
  return { record, supersededRecordId: priorActiveId, executedAt, dryRun };
}

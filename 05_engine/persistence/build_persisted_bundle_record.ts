import { DiagnosticRunBundle } from "../types/DiagnosticRunBundle";
import { PersistedBundleRecord } from "../types/PersistedBundleRecord";
import { resolveNextPersistedBundleRevision } from "./resolve_persisted_bundle_revision";

export function buildPersistedBundleId(
  bundle: DiagnosticRunBundle
): string {
  const organizationId = bundle.unitKey.organizationId;
  const siteId = bundle.unitKey.siteId;
  const weekId = bundle.unitKey.operationalWeek.weekId;
  const bundleVersion = bundle.bundleVersion;
  const revision = resolveNextPersistedBundleRevision(bundle);

  return `pbr::${organizationId}::${siteId}::${weekId}::${bundleVersion}::${revision}`;
}

export function buildPersistedBundleRecord(params: {
  bundle: DiagnosticRunBundle;
  storageBackend?: "filesystem" | "database" | "object_store";
  storagePath?: string;
  storedBy?: string;
  integrityCheckStatus?: "passed" | "unknown" | "failed";
  recordStatus?: "active" | "superseded" | "archived";
  persistenceVersion?: string;
}): PersistedBundleRecord {
  const {
    bundle,
    storageBackend = "filesystem",
    storagePath = "",
    storedBy = "phase3_filesystem_adapter",
    integrityCheckStatus = "unknown",
    recordStatus = "active",
    persistenceVersion = "1.0.0",
  } = params;

  const persistedBundleId = buildPersistedBundleId(bundle);
  const storedAt = new Date().toISOString();

  return {
    persistedBundleId,
    persistenceVersion,
    recordStatus,
    createdAt: bundle.generatedAt,
    storedAt,
    unitKey: bundle.unitKey,
    identity: {
      bundleType: bundle.bundleType,
      bundleVersion: bundle.bundleVersion,
      snapshotId: bundle.snapshot.snapshotId,
      twinId: bundle.twin.twinId,
      reportId: bundle.weeklyReport.reportId,
      scenarioFile: bundle.scenarioFile,
    },
    bundle,
    immutability: {
      bundleFrozen: true,
      snapshotFrozen: true,
      reportFrozen: true,
      validationFrozen: true,
      mutationPolicy: "append_only",
    },
    retrieval: {
      organizationId: bundle.unitKey.organizationId,
      siteId: bundle.unitKey.siteId,
      sectorType: bundle.unitKey.sectorType,
      weekId: bundle.unitKey.operationalWeek.weekId,
      calendarYear: bundle.unitKey.operationalWeek.calendarYear,
      weekNumber: bundle.unitKey.operationalWeek.weekNumber,
      snapshotId: bundle.snapshot.snapshotId,
      twinId: bundle.twin.twinId,
      persistedBundleId,
    },
    storageMeta: {
      storageBackend,
      storagePath,
      recordFormat: "json",
      storedBy,
      integrityCheckStatus,
    },
  };
}
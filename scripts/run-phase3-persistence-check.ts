import fs from "fs";
import path from "path";
import { FilesystemPersistenceAdapter } from "../05_engine/persistence/filesystem/FilesystemPersistenceAdapter";
import { buildPersistedBundleId } from "../05_engine/persistence/build_persisted_bundle_record";
import { DiagnosticRunBundle } from "../05_engine/types/DiagnosticRunBundle";
import { PersistedBundleRecord } from "../05_engine/types/PersistedBundleRecord";

function readJsonFile<T>(relativePath: string): T {
  const fullPath = path.resolve(__dirname, `../${relativePath}`);
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function getScenarioFileName(): string {
  const arg = process.argv[2];
  return arg && arg.trim().length > 0
    ? arg.trim()
    : "sample_restaurant_week_reporting_failure.json";
}

function getArtifactBaseName(fileName: string): string {
  return fileName.replace(/\.json$/i, "");
}

function loadBundle(fileName: string): DiagnosticRunBundle {
  const baseName = getArtifactBaseName(fileName);
  return readJsonFile<DiagnosticRunBundle>(
    `10_examples/bundles/${baseName}.bundle.json`
  );
}

function validatePersistedRecord(
  record: PersistedBundleRecord,
  bundle: DiagnosticRunBundle,
  expectedPersistedBundleId: string
): void {
  assert(
    record.persistedBundleId === expectedPersistedBundleId,
    "persistedBundleId must match expected canonical ID"
  );

  assert(
    record.recordStatus === "active" ||
      record.recordStatus === "superseded" ||
      record.recordStatus === "archived",
    "recordStatus must be valid"
  );

  assert(
    record.identity.snapshotId === bundle.snapshot.snapshotId,
    "identity.snapshotId must match bundle snapshotId"
  );

  assert(
    record.identity.twinId === bundle.twin.twinId,
    "identity.twinId must match bundle twinId"
  );

  assert(
    record.identity.reportId === bundle.weeklyReport.reportId,
    "identity.reportId must match bundle reportId"
  );

  assert(
    record.identity.bundleType === bundle.bundleType,
    "identity.bundleType must match bundle bundleType"
  );

  assert(
    record.identity.bundleVersion === bundle.bundleVersion,
    "identity.bundleVersion must match bundle bundleVersion"
  );

  assert(
    record.retrieval.persistedBundleId === record.persistedBundleId,
    "retrieval.persistedBundleId must match persistedBundleId"
  );

  assert(
    record.retrieval.snapshotId === bundle.snapshot.snapshotId,
    "retrieval.snapshotId must match bundle snapshotId"
  );

  assert(
    record.retrieval.twinId === bundle.twin.twinId,
    "retrieval.twinId must match bundle twinId"
  );

  assert(
    record.storageMeta.storageBackend === "filesystem",
    "storageMeta.storageBackend must be filesystem"
  );

  assert(
    typeof record.storageMeta.storagePath === "string" &&
      record.storageMeta.storagePath.trim().length > 0,
    "storageMeta.storagePath must be present"
  );

  assert(
    record.bundle.bundleType === "diagnostic_run_bundle",
    "bundle.bundleType must be diagnostic_run_bundle"
  );

  assert(
    record.bundle.snapshot.snapshotId === bundle.snapshot.snapshotId,
    "persisted bundle snapshot must match source bundle snapshot"
  );

  assert(
    record.bundle.weeklyReport.reportId === bundle.weeklyReport.reportId,
    "persisted bundle weeklyReport must match source bundle report"
  );

  assert(
    record.bundle.twin.twinId === bundle.twin.twinId,
    "persisted bundle twin must match source bundle twin"
  );

  assert(
    record.bundle.normalizedPayload.payloadId ===
      bundle.normalizedPayload.payloadId,
    "persisted bundle normalizedPayload must match source bundle normalizedPayload"
  );
}

async function main(): Promise<void> {
  const scenarioFile = getScenarioFileName();
  const bundle = loadBundle(scenarioFile);
  const expectedPersistedBundleId = buildPersistedBundleId(bundle);

  const adapter = new FilesystemPersistenceAdapter();
  const loadResult = await adapter.loadByPersistedBundleId(
    expectedPersistedBundleId
  );

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 3 PERSISTENCE CHECK");
  console.log("--------------------------------------------------");
  console.log(`Scenario File: ${scenarioFile}`);
  console.log(`Persisted Bundle ID: ${expectedPersistedBundleId}`);

  assert(loadResult.found, "persisted record must exist");
  assert(loadResult.record !== null, "persisted record must not be null");

  validatePersistedRecord(
    loadResult.record as PersistedBundleRecord,
    bundle,
    expectedPersistedBundleId
  );

  console.log("[PASS] persisted record exists");
  console.log("[PASS] canonical identity coherence");
  console.log("[PASS] bundle identity linkage");
  console.log("[PASS] retrieval linkage");
  console.log("[PASS] storage metadata presence");
  console.log("[PASS] persisted bundle integrity");
  console.log("Persistence check passed.");
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error("PERSISTENCE CHECK FAILED");
  console.error(error);
  process.exit(1);
});
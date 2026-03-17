import fs from "fs";
import path from "path";
import { FilesystemPersistenceAdapter } from "../05_engine/persistence/filesystem/FilesystemPersistenceAdapter";
import { buildPersistedBundleRecord } from "../05_engine/persistence/build_persisted_bundle_record";
import { DiagnosticRunBundle } from "../05_engine/types/DiagnosticRunBundle";
import { PersistedBundleRecord } from "../05_engine/types/PersistedBundleRecord";
import { queryPersistedRecordIndex } from "../05_engine/persistence/query_persisted_record_index";

function readJsonFile<T>(relativePath: string): T {
  const fullPath = path.resolve(__dirname, `../${relativePath}`);
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeAbsoluteJsonFile(fullPath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
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

function markRecordAsSuperseded(storagePath: string): PersistedBundleRecord {
  const raw = fs.readFileSync(storagePath, "utf-8");
  const record = JSON.parse(raw) as PersistedBundleRecord;

  const updatedRecord: PersistedBundleRecord = {
    ...record,
    recordStatus: "superseded",
  };

  writeAbsoluteJsonFile(storagePath, updatedRecord);
  return updatedRecord;
}

function rebuildPersistenceIndex(): void {
  const command = "npm run phase3:rebuild-index";
  require("child_process").execSync(command, {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
  });
}

async function main(): Promise<void> {
  const scenarioFile = getScenarioFileName();
  const bundle = loadBundle(scenarioFile);

  const adapter = new FilesystemPersistenceAdapter();

  const existingActiveEntries = queryPersistedRecordIndex({
    organizationId: bundle.unitKey.organizationId,
    siteId: bundle.unitKey.siteId,
    weekId: bundle.unitKey.operationalWeek.weekId,
    recordStatus: "active",
  });

  const supersededIds: string[] = [];

  for (const entry of existingActiveEntries) {
    markRecordAsSuperseded(entry.storagePath);
    supersededIds.push(entry.persistedBundleId);
  }

  const persistedRecord = buildPersistedBundleRecord({
    bundle,
    storageBackend: "filesystem",
    storedBy: "run-phase3-superseding-persist",
    integrityCheckStatus: "passed",
    recordStatus: "active",
    persistenceVersion: "1.0.0",
  });

  const saveResult = await adapter.save(persistedRecord);

  rebuildPersistenceIndex();

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 3 SUPERSEDING PERSIST");
  console.log("--------------------------------------------------");
  console.log(`Scenario File: ${scenarioFile}`);
  console.log(`New Persisted Bundle ID: ${persistedRecord.persistedBundleId}`);
  console.log(`Snapshot ID: ${persistedRecord.identity.snapshotId}`);
  console.log(`Twin ID: ${persistedRecord.identity.twinId}`);
  console.log(`Report ID: ${persistedRecord.identity.reportId}`);
  console.log(`Storage Path: ${saveResult.storagePath}`);
  console.log(`Stored At: ${saveResult.storedAt}`);
  console.log(`Record Status: ${saveResult.recordStatus}`);
  console.log(`Superseded Count: ${supersededIds.length}`);

  if (supersededIds.length > 0) {
    console.log("Superseded Records:");
    for (const id of supersededIds) {
      console.log(`- ${id}`);
    }
  }

  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error("PHASE 3 SUPERSEDING PERSIST FAILED");
  console.error(error);
  process.exit(1);
});
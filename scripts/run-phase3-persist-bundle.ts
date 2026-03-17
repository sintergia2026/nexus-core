import fs from "fs";
import path from "path";
import { FilesystemPersistenceAdapter } from "../05_engine/persistence/filesystem/FilesystemPersistenceAdapter";
import { buildPersistedBundleRecord } from "../05_engine/persistence/build_persisted_bundle_record";
import { DiagnosticRunBundle } from "../05_engine/types/DiagnosticRunBundle";

function readJsonFile<T>(relativePath: string): T {
  const fullPath = path.resolve(__dirname, `../${relativePath}`);
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
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

async function main(): Promise<void> {
  const scenarioFile = getScenarioFileName();
  const bundle = loadBundle(scenarioFile);

  const adapter = new FilesystemPersistenceAdapter();

  const persistedRecord = buildPersistedBundleRecord({
    bundle,
    storageBackend: "filesystem",
    storedBy: "run-phase3-persist-bundle",
    integrityCheckStatus: "passed",
    recordStatus: "active",
    persistenceVersion: "1.0.0",
  });

  const saveResult = await adapter.save(persistedRecord);

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 3 PERSIST BUNDLE");
  console.log("--------------------------------------------------");
  console.log(`Scenario File: ${scenarioFile}`);
  console.log(`Persisted Bundle ID: ${persistedRecord.persistedBundleId}`);
  console.log(`Snapshot ID: ${persistedRecord.identity.snapshotId}`);
  console.log(`Twin ID: ${persistedRecord.identity.twinId}`);
  console.log(`Report ID: ${persistedRecord.identity.reportId}`);
  console.log(`Storage Path: ${saveResult.storagePath}`);
  console.log(`Stored At: ${saveResult.storedAt}`);
  console.log(`Record Status: ${saveResult.recordStatus}`);
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error("PHASE 3 PERSIST BUNDLE FAILED");
  console.error(error);
  process.exit(1);
});
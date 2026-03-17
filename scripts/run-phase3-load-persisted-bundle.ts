import { FilesystemPersistenceAdapter } from "../05_engine/persistence/filesystem/FilesystemPersistenceAdapter";
import { buildPersistedBundleId } from "../05_engine/persistence/build_persisted_bundle_record";
import { DiagnosticRunBundle } from "../05_engine/types/DiagnosticRunBundle";
import fs from "fs";
import path from "path";

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
  const persistedBundleId = buildPersistedBundleId(bundle);

  const adapter = new FilesystemPersistenceAdapter();
  const loadResult = await adapter.loadByPersistedBundleId(persistedBundleId);

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 3 LOAD PERSISTED BUNDLE");
  console.log("--------------------------------------------------");
  console.log(`Scenario File: ${scenarioFile}`);
  console.log(`Persisted Bundle ID: ${persistedBundleId}`);
  console.log(`Found: ${loadResult.found}`);

  if (!loadResult.found || !loadResult.record) {
    console.log("Record: null");
    console.log("--------------------------------------------------");
    return;
  }

  console.log(`Record Status: ${loadResult.record.recordStatus}`);
  console.log(`Snapshot ID: ${loadResult.record.identity.snapshotId}`);
  console.log(`Twin ID: ${loadResult.record.identity.twinId}`);
  console.log(`Report ID: ${loadResult.record.identity.reportId}`);
  console.log(`Storage Backend: ${loadResult.record.storageMeta.storageBackend}`);
  console.log(`Storage Path: ${loadResult.record.storageMeta.storagePath}`);
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error("PHASE 3 LOAD PERSISTED BUNDLE FAILED");
  console.error(error);
  process.exit(1);
});
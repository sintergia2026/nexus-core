import fs from "fs";
import path from "path";
import { FilesystemPersistenceAdapter } from "../05_engine/persistence/filesystem/FilesystemPersistenceAdapter";
import { PersistedBundleRecord } from "../05_engine/types/PersistedBundleRecord";
import {
  PersistedRecordIndex,
  PersistedRecordIndexEntry,
} from "../05_engine/types/PersistedRecordIndex";

function writeJsonFile(relativePath: string, data: unknown): void {
  const fullPath = path.resolve(__dirname, `../${relativePath}`);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function toIndexEntry(record: PersistedBundleRecord): PersistedRecordIndexEntry {
  return {
    persistedBundleId: record.persistedBundleId,
    recordStatus: record.recordStatus,
    organizationId: record.retrieval.organizationId,
    siteId: record.retrieval.siteId,
    sectorType: record.retrieval.sectorType,
    weekId: record.retrieval.weekId,
    calendarYear: record.retrieval.calendarYear,
    weekNumber: record.retrieval.weekNumber,
    snapshotId: record.identity.snapshotId,
    twinId: record.identity.twinId,
    reportId: record.identity.reportId,
    bundleVersion: record.identity.bundleVersion,
    persistenceVersion: record.persistenceVersion,
    storagePath: record.storageMeta.storagePath,
    storedAt: record.storedAt,
  };
}

async function main(): Promise<void> {
  const adapter = new FilesystemPersistenceAdapter();
  const records = await adapter.query({});

  const entries = records
    .map(toIndexEntry)
    .sort((a, b) => a.persistedBundleId.localeCompare(b.persistedBundleId));

  const index: PersistedRecordIndex = {
    indexType: "persisted_record_index",
    indexVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    recordCount: entries.length,
    entries,
  };

  const outputPath = "10_examples/persisted_records/index.persisted_records.json";
  writeJsonFile(outputPath, index);

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 3 REBUILD PERSISTENCE INDEX");
  console.log("--------------------------------------------------");
  console.log(`Index Type: ${index.indexType}`);
  console.log(`Index Version: ${index.indexVersion}`);
  console.log(`Record Count: ${index.recordCount}`);
  console.log(`Index File: ${path.resolve(__dirname, `../${outputPath}`)}`);
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error("PHASE 3 REBUILD PERSISTENCE INDEX FAILED");
  console.error(error);
  process.exit(1);
});
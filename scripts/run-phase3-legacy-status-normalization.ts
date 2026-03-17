import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { PersistedBundleRecord } from "../05_engine/types/PersistedBundleRecord";

function getPersistedRecordsDirectory(): string {
  return path.resolve(__dirname, "../10_examples/persisted_records");
}

function isLegacyPersistedBundleId(persistedBundleId: string): boolean {
  return !persistedBundleId.includes("::rev-");
}

function readPersistedRecord(fullPath: string): PersistedBundleRecord {
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as PersistedBundleRecord;
}

function writePersistedRecord(
  fullPath: string,
  record: PersistedBundleRecord
): void {
  fs.writeFileSync(fullPath, JSON.stringify(record, null, 2) + "\n", "utf-8");
}

function normalizeLegacyRecords(): {
  scannedCount: number;
  normalizedCount: number;
  unchangedCount: number;
  normalizedIds: string[];
} {
  const directory = getPersistedRecordsDirectory();

  if (!fs.existsSync(directory)) {
    return {
      scannedCount: 0,
      normalizedCount: 0,
      unchangedCount: 0,
      normalizedIds: [],
    };
  }

  const fileNames = fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(".json"))
    .filter((name) => name !== "index.persisted_records.json");

  let scannedCount = 0;
  let normalizedCount = 0;
  let unchangedCount = 0;
  const normalizedIds: string[] = [];

  for (const fileName of fileNames) {
    const fullPath = path.join(directory, fileName);
    const record = readPersistedRecord(fullPath);

    scannedCount += 1;

    if (!isLegacyPersistedBundleId(record.persistedBundleId)) {
      unchangedCount += 1;
      continue;
    }

    if (record.recordStatus === "active") {
      const updatedRecord: PersistedBundleRecord = {
        ...record,
        recordStatus: "superseded",
      };

      writePersistedRecord(fullPath, updatedRecord);
      normalizedCount += 1;
      normalizedIds.push(record.persistedBundleId);
      continue;
    }

    unchangedCount += 1;
  }

  return {
    scannedCount,
    normalizedCount,
    unchangedCount,
    normalizedIds,
  };
}

function rebuildPersistenceIndex(): void {
  execSync("npm run phase3:rebuild-index", {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
  });
}

function main(): void {
  const result = normalizeLegacyRecords();

  rebuildPersistenceIndex();

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 3 LEGACY STATUS NORMALIZATION");
  console.log("--------------------------------------------------");
  console.log(`Scanned Count: ${result.scannedCount}`);
  console.log(`Normalized Count: ${result.normalizedCount}`);
  console.log(`Unchanged Count: ${result.unchangedCount}`);

  if (result.normalizedIds.length > 0) {
    console.log("Normalized Legacy Records:");
    for (const persistedBundleId of result.normalizedIds) {
      console.log(`- ${persistedBundleId}`);
    }
  }

  console.log("--------------------------------------------------");
}

main();
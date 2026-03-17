import fs from "fs";
import path from "path";
import {
  PersistenceAdapter,
  PersistenceLoadResult,
  PersistenceQuery,
  PersistenceSaveResult,
} from "../PersistenceAdapter";
import { PersistedBundleRecord } from "../../types/PersistedBundleRecord";

function isPersistedBundleRecord(value: unknown): value is PersistedBundleRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.persistedBundleId !== "string") {
    return false;
  }

  if (!record.retrieval || typeof record.retrieval !== "object") {
    return false;
  }

  if (!record.identity || typeof record.identity !== "object") {
    return false;
  }

  if (!record.storageMeta || typeof record.storageMeta !== "object") {
    return false;
  }

  if (!record.bundle || typeof record.bundle !== "object") {
    return false;
  }

  return true;
}

export class FilesystemPersistenceAdapter implements PersistenceAdapter {
  private readonly baseDirectory: string;

  constructor(baseDirectory?: string) {
    this.baseDirectory =
      baseDirectory ??
      path.resolve(__dirname, "../../../10_examples/persisted_records");
  }

  async save(record: PersistedBundleRecord): Promise<PersistenceSaveResult> {
    const filePath = this.buildRecordPath(record.persistedBundleId);
    const storedAt = new Date().toISOString();

    const persistedRecord: PersistedBundleRecord = {
      ...record,
      storedAt,
      storageMeta: {
        ...record.storageMeta,
        storageBackend: "filesystem",
        storagePath: filePath,
      },
    };

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(
      filePath,
      JSON.stringify(persistedRecord, null, 2) + "\n",
      "utf-8"
    );

    return {
      persistedBundleId: persistedRecord.persistedBundleId,
      storagePath: persistedRecord.storageMeta.storagePath,
      storedAt: persistedRecord.storedAt,
      recordStatus: persistedRecord.recordStatus,
    };
  }

  async loadByPersistedBundleId(
    persistedBundleId: string
  ): Promise<PersistenceLoadResult> {
    const filePath = this.buildRecordPath(persistedBundleId);

    if (!fs.existsSync(filePath)) {
      return {
        found: false,
        record: null,
      };
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isPersistedBundleRecord(parsed)) {
      return {
        found: false,
        record: null,
      };
    }

    return {
      found: true,
      record: parsed,
    };
  }

  async query(query: PersistenceQuery): Promise<PersistedBundleRecord[]> {
    const allRecords = this.readAllRecords();
    return allRecords.filter((record) => this.matchesQuery(record, query));
  }

  private buildRecordPath(persistedBundleId: string): string {
    return path.join(this.baseDirectory, `${persistedBundleId}.json`);
  }

  private readAllRecords(): PersistedBundleRecord[] {
    if (!fs.existsSync(this.baseDirectory)) {
      return [];
    }

    const results: PersistedBundleRecord[] = [];

    const walk = (dirPath: string): void => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          walk(fullPath);
          continue;
        }

        if (!entry.isFile() || !entry.name.endsWith(".json")) {
          continue;
        }

        if (entry.name === "index.persisted_records.json") {
          continue;
        }

        const raw = fs.readFileSync(fullPath, "utf-8");
        const parsed = JSON.parse(raw) as unknown;

        if (!isPersistedBundleRecord(parsed)) {
          continue;
        }

        results.push(parsed);
      }
    };

    walk(this.baseDirectory);
    return results;
  }

  private matchesQuery(
    record: PersistedBundleRecord,
    query: PersistenceQuery
  ): boolean {
    if (
      query.persistedBundleId !== undefined &&
      record.persistedBundleId !== query.persistedBundleId
    ) {
      return false;
    }

    if (
      query.organizationId !== undefined &&
      record.retrieval.organizationId !== query.organizationId
    ) {
      return false;
    }

    if (query.siteId !== undefined && record.retrieval.siteId !== query.siteId) {
      return false;
    }

    if (
      query.sectorType !== undefined &&
      record.retrieval.sectorType !== query.sectorType
    ) {
      return false;
    }

    if (query.weekId !== undefined && record.retrieval.weekId !== query.weekId) {
      return false;
    }

    if (
      query.calendarYear !== undefined &&
      record.retrieval.calendarYear !== query.calendarYear
    ) {
      return false;
    }

    if (
      query.weekNumber !== undefined &&
      record.retrieval.weekNumber !== query.weekNumber
    ) {
      return false;
    }

    if (
      query.snapshotId !== undefined &&
      record.retrieval.snapshotId !== query.snapshotId
    ) {
      return false;
    }

    if (query.twinId !== undefined && record.retrieval.twinId !== query.twinId) {
      return false;
    }

    if (
      query.recordStatus !== undefined &&
      record.recordStatus !== query.recordStatus
    ) {
      return false;
    }

    return true;
  }
}
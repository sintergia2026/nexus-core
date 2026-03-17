import fs from "fs";
import path from "path";
import {
  PersistedRecordIndex,
  PersistedRecordIndexEntry,
} from "../types/PersistedRecordIndex";

export interface PersistedRecordIndexQuery {
  persistedBundleId?: string;
  organizationId?: string;
  siteId?: string;
  sectorType?: string;
  weekId?: string;
  calendarYear?: number;
  weekNumber?: number;
  snapshotId?: string;
  twinId?: string;
  reportId?: string;
  recordStatus?: "active" | "superseded" | "archived";
}

function readJsonFile<T>(relativePath: string): T {
  const fullPath = path.resolve(__dirname, `../../${relativePath}`);
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

export function loadPersistedRecordIndex(): PersistedRecordIndex {
  return readJsonFile<PersistedRecordIndex>(
    "10_examples/persisted_records/index.persisted_records.json"
  );
}

export function queryPersistedRecordIndex(
  query: PersistedRecordIndexQuery
): PersistedRecordIndexEntry[] {
  const index = loadPersistedRecordIndex();

  return index.entries.filter((entry) => {
    if (
      query.persistedBundleId !== undefined &&
      entry.persistedBundleId !== query.persistedBundleId
    ) {
      return false;
    }

    if (
      query.organizationId !== undefined &&
      entry.organizationId !== query.organizationId
    ) {
      return false;
    }

    if (query.siteId !== undefined && entry.siteId !== query.siteId) {
      return false;
    }

    if (
      query.sectorType !== undefined &&
      entry.sectorType !== query.sectorType
    ) {
      return false;
    }

    if (query.weekId !== undefined && entry.weekId !== query.weekId) {
      return false;
    }

    if (
      query.calendarYear !== undefined &&
      entry.calendarYear !== query.calendarYear
    ) {
      return false;
    }

    if (
      query.weekNumber !== undefined &&
      entry.weekNumber !== query.weekNumber
    ) {
      return false;
    }

    if (
      query.snapshotId !== undefined &&
      entry.snapshotId !== query.snapshotId
    ) {
      return false;
    }

    if (query.twinId !== undefined && entry.twinId !== query.twinId) {
      return false;
    }

    if (query.reportId !== undefined && entry.reportId !== query.reportId) {
      return false;
    }

    if (
      query.recordStatus !== undefined &&
      entry.recordStatus !== query.recordStatus
    ) {
      return false;
    }

    return true;
  });
}
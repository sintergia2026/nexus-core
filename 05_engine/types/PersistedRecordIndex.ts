export interface PersistedRecordIndexEntry {
  persistedBundleId: string;
  recordStatus: "active" | "superseded" | "archived";
  organizationId: string;
  siteId: string;
  sectorType: string;
  weekId: string;
  calendarYear: number;
  weekNumber: number;
  snapshotId: string;
  twinId: string;
  reportId: string;
  bundleVersion: string;
  persistenceVersion: string;
  storagePath: string;
  storedAt: string;
}

export interface PersistedRecordIndex {
  indexType: "persisted_record_index";
  indexVersion: string;
  generatedAt: string;
  recordCount: number;
  entries: PersistedRecordIndexEntry[];
}
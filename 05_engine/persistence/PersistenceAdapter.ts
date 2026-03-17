import { PersistedBundleRecord } from "../types/PersistedBundleRecord";

export interface PersistenceSaveResult {
  persistedBundleId: string;
  storagePath: string;
  storedAt: string;
  recordStatus: PersistedBundleRecord["recordStatus"];
}

export interface PersistenceLoadResult {
  found: boolean;
  record: PersistedBundleRecord | null;
}

export interface PersistenceQuery {
  persistedBundleId?: string;
  organizationId?: string;
  siteId?: string;
  sectorType?: string;
  weekId?: string;
  calendarYear?: number;
  weekNumber?: number;
  snapshotId?: string;
  twinId?: string;
  recordStatus?: PersistedBundleRecord["recordStatus"];
}

export interface PersistenceAdapter {
  save(record: PersistedBundleRecord): Promise<PersistenceSaveResult>;
  loadByPersistedBundleId(
    persistedBundleId: string
  ): Promise<PersistenceLoadResult>;
  query(query: PersistenceQuery): Promise<PersistedBundleRecord[]>;
}
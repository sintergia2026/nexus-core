import { DiagnosticRunBundle } from "./DiagnosticRunBundle";

export interface PersistedBundleIdentity {
  bundleType: DiagnosticRunBundle["bundleType"];
  bundleVersion: DiagnosticRunBundle["bundleVersion"];
  snapshotId: string;
  twinId: string;
  reportId: string;
  scenarioFile: string;
}

export interface PersistedBundleImmutability {
  bundleFrozen: boolean;
  snapshotFrozen: boolean;
  reportFrozen: boolean;
  validationFrozen: boolean;
  mutationPolicy: "append_only" | "replace_with_governance";
}

export interface PersistedBundleRetrieval {
  organizationId: string;
  siteId: string;
  sectorType: string;
  weekId: string;
  calendarYear: number;
  weekNumber: number;
  snapshotId: string;
  twinId: string;
  persistedBundleId: string;
}

export interface PersistedBundleStorageMeta {
  storageBackend: "filesystem" | "database" | "object_store";
  storagePath: string;
  recordFormat: "json";
  storedBy: string;
  integrityCheckStatus: "passed" | "unknown" | "failed";
}

export interface PersistedBundleRecord {
  persistedBundleId: string;
  persistenceVersion: string;
  recordStatus: "active" | "superseded" | "archived";
  createdAt: string;
  storedAt: string;
  unitKey: DiagnosticRunBundle["unitKey"];
  identity: PersistedBundleIdentity;
  bundle: DiagnosticRunBundle;
  immutability: PersistedBundleImmutability;
  retrieval: PersistedBundleRetrieval;
  storageMeta: PersistedBundleStorageMeta;
}
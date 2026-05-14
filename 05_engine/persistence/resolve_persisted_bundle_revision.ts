import fs from "fs";
import path from "path";
import { DiagnosticRunBundle } from "../types/DiagnosticRunBundle";
import { PersistedRecordIndex } from "../types/PersistedRecordIndex";

function getRecordsDirectory(): string {
  return (
    process.env.NEXUS_RECORDS_DIR ??
    path.resolve(__dirname, "../../10_examples/persisted_records")
  );
}

function loadPersistedRecordIndexSafe(): PersistedRecordIndex | null {
  const fullPath = path.join(
    getRecordsDirectory(),
    "index.persisted_records.json"
  );

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as PersistedRecordIndex;
}

function getContextPrefix(bundle: DiagnosticRunBundle): string {
  return [
    "pbr",
    bundle.unitKey.organizationId,
    bundle.unitKey.siteId,
    bundle.unitKey.operationalWeek.weekId,
    bundle.bundleVersion,
  ].join("::");
}

function parseRevisionNumber(persistedBundleId: string): number | null {
  const match = persistedBundleId.match(/::rev-(\d{4})$/);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatRevisionNumber(revision: number): string {
  return `rev-${String(revision).padStart(4, "0")}`;
}

export function resolveNextPersistedBundleRevision(
  bundle: DiagnosticRunBundle
): string {
  const index = loadPersistedRecordIndexSafe();
  const contextPrefix = getContextPrefix(bundle);

  if (!index || !Array.isArray(index.entries) || index.entries.length === 0) {
    return formatRevisionNumber(1);
  }

  const matchingRevisions = index.entries
    .map((entry) => entry.persistedBundleId)
    .filter((persistedBundleId) => persistedBundleId.startsWith(`${contextPrefix}::rev-`))
    .map(parseRevisionNumber)
    .filter((revision): revision is number => revision !== null);

  if (matchingRevisions.length === 0) {
    return formatRevisionNumber(1);
  }

  const maxRevision = Math.max(...matchingRevisions);
  return formatRevisionNumber(maxRevision + 1);
}

export function resolveCurrentContextPrefix(bundle: DiagnosticRunBundle): string {
  return getContextPrefix(bundle);
}
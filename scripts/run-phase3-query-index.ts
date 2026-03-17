import { queryPersistedRecordIndex } from "../05_engine/persistence/query_persisted_record_index";

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

function getQuery() {
  const calendarYearRaw = getArgValue("--calendarYear");
  const weekNumberRaw = getArgValue("--weekNumber");

  return {
    persistedBundleId: getArgValue("--persistedBundleId"),
    organizationId: getArgValue("--organizationId"),
    siteId: getArgValue("--siteId"),
    sectorType: getArgValue("--sectorType"),
    weekId: getArgValue("--weekId"),
    calendarYear:
      calendarYearRaw !== undefined ? Number(calendarYearRaw) : undefined,
    weekNumber: weekNumberRaw !== undefined ? Number(weekNumberRaw) : undefined,
    snapshotId: getArgValue("--snapshotId"),
    twinId: getArgValue("--twinId"),
    reportId: getArgValue("--reportId"),
    recordStatus: getArgValue("--recordStatus") as
      | "active"
      | "superseded"
      | "archived"
      | undefined,
  };
}

function main(): void {
  const query = getQuery();
  const results = queryPersistedRecordIndex(query);

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 3 QUERY PERSISTENCE INDEX");
  console.log("--------------------------------------------------");
  console.log(`Results: ${results.length}`);

  for (const entry of results) {
    console.log("");
    console.log(`Persisted Bundle ID: ${entry.persistedBundleId}`);
    console.log(`Record Status: ${entry.recordStatus}`);
    console.log(`Organization ID: ${entry.organizationId}`);
    console.log(`Site ID: ${entry.siteId}`);
    console.log(`Sector Type: ${entry.sectorType}`);
    console.log(`Week ID: ${entry.weekId}`);
    console.log(`Snapshot ID: ${entry.snapshotId}`);
    console.log(`Twin ID: ${entry.twinId}`);
    console.log(`Report ID: ${entry.reportId}`);
    console.log(`Storage Path: ${entry.storagePath}`);
    console.log(`Stored At: ${entry.storedAt}`);
  }

  console.log("--------------------------------------------------");
}

main();
export interface ApiRecordSummary {
  persistedBundleId: string;
  recordStatus: "active" | "superseded" | "archived";
  organizationId: string;
  siteId: string;
  sectorType: string;
  weekId: string;
  calendarYear: number;
  weekNumber: number;
  bundleVersion: string;
  persistenceVersion: string;
  snapshotId: string;
  twinId: string;
  reportId: string;
  stateLabel: string;
  decisionLabel: string;
  priority: string;
  activeSignals: string[];
  activeConstraints: string[];
  storedAt: string;
}
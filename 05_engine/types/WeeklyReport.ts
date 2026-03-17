import { DiagnosticSnapshot, DiagnosticSnapshotUnitKey } from "../../04_twin/types/DiagnosticSnapshot";

export interface WeeklyReportSection {
  sectionCode: string;
  title: string;
  content: string;
}

export interface WeeklyReport {
  reportId: string;
  reportType: "weekly_report";
  generatedAt: string;
  unitKey: DiagnosticSnapshotUnitKey;
  snapshotId: string;
  twinId: string;
  title: string;
  subtitle: string;
  executiveSummary: string;
  priorityActions: string[];
  sections: WeeklyReportSection[];
  linkedSnapshot: DiagnosticSnapshot;
  deliveryStatus: string;
  version: string;
}
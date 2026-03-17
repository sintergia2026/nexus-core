import { DiagnosticSnapshot } from "../../04_twin/types/DiagnosticSnapshot";
import { OperationalUnitKey } from "../../02_contracts/OperationalWeek";

export interface WeeklyReportSection {
  sectionCode:
    | "executive_summary"
    | "metric_overview"
    | "signal_overview"
    | "constraints"
    | "priority_actions";
  title: string;
  content: string;
}

export interface WeeklyReport {
  reportId: string;
  reportType: "weekly_report";
  generatedAt: string; // ISO datetime

  unitKey: OperationalUnitKey;
  snapshotId: string;
  twinId: string;

  title: string;
  subtitle: string;

  executiveSummary: string;
  priorityActions: string[];

  sections: WeeklyReportSection[];
  linkedSnapshot: DiagnosticSnapshot;

  deliveryStatus: "draft" | "ready";
  version: string;
}
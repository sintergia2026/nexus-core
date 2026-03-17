import { OperationalWeek } from "./OperationalWeek";

export type SectorType =
  | "restaurants"
  | "retail"
  | "services"
  | "healthcare"
  | "construction"
  | "education"
  | "technology"
  | "logistics"
  | "general_ops";

export interface ThroughputInput {
  unitsCompleted: number;
  unitLabel: string; // e.g. orders, tickets, tasks, deliveries
}

export interface RevenueInput {
  grossRevenue: number;
  capturedRevenue: number;
  estimatedLeakage?: number;
  currency: string; // e.g. USD, COP
}

export interface StaffingInput {
  scheduledHours: number;
  workedHours: number;
  headcountScheduled: number;
  headcountActual: number;
}

export interface TimeInput {
  avgCycleTimeMinutes: number;
  avgWaitTimeMinutes?: number;
  avgServiceTimeMinutes?: number;
}

export interface DemandInput {
  demandUnits: number;
  peakDemandUnits?: number;
  volatilityIndex?: number; // optional raw input if available
}

export interface ReportingInput {
  expectedReports: number;
  submittedReports: number;
  missingFieldsCount: number;
  lateSubmissionsCount: number;
  sourceReliabilityScore?: number; // 0-100 optional
}

export interface OperationalIntakePayload {
  payloadId: string;
  capturedAt: string; // ISO datetime
  source: string; // manual_form | spreadsheet | api | imported_csv | etc.
  sectorType: SectorType;

  organizationId: string;
  organizationName: string;
  siteId: string;
  siteName: string;

  operationalWeek: OperationalWeek;

  throughput: ThroughputInput;
  revenue: RevenueInput;
  staffing: StaffingInput;
  time: TimeInput;
  demand: DemandInput;
  reporting: ReportingInput;

  notes?: string[];
  tags?: string[];

  submittedBy?: {
    actorId?: string;
    actorName?: string;
    actorRole?: string;
  };
}

export interface OperationalIntakeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

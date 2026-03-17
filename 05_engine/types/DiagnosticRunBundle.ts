import { DiagnosticSnapshot } from "../../04_twin/types/DiagnosticSnapshot";
import { TwinState } from "../../04_twin/types/TwinState";
import { NormalizedOperationalIntakePayload } from "../normalization/normalization_engine";
import { WeeklyReport } from "./WeeklyReport";

export interface BundleArtifactReference {
  artifactType: string;
  artifactPath: string;
  generationStatus: "present" | "missing";
  artifactSnapshotId?: string;
  artifactReportId?: string;
}

export interface BundleArtifacts {
  diagnosticArtifact: BundleArtifactReference;
  weeklyReportArtifact: BundleArtifactReference;
}

export interface BundleValidationContext {
  typecheckPassed: boolean;
  baselineContrastPassed: boolean;
  contractsCheckPassed: boolean;
  candidateReviewStatus: string;
  executedAt: string;
}

export interface DiagnosticRunBundle {
  bundleType: "diagnostic_run_bundle";
  bundleVersion: string;
  generatedAt: string;
  scenarioFile: string;
  unitKey: DiagnosticSnapshot["unitKey"];
  normalizedPayload: NormalizedOperationalIntakePayload;
  metrics: DiagnosticSnapshot["metrics"];
  signals: DiagnosticSnapshot["signals"];
  twin: TwinState;
  snapshot: DiagnosticSnapshot;
  weeklyReport: WeeklyReport;
  artifacts: BundleArtifacts;
  validation: BundleValidationContext;
}
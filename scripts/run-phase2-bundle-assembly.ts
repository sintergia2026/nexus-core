import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  runDiagnostic,
  RunDiagnosticResult,
} from "../05_engine/orchestration/run_diagnostic";
import { OperationalIntakePayload } from "../02_contracts/OperationalIntakePayload";
import {
  BundleValidationContext,
  DiagnosticRunBundle,
} from "../05_engine/types/DiagnosticRunBundle";
import { WeeklyReport } from "../05_engine/types/WeeklyReport";
import { DiagnosticSnapshot } from "../04_twin/types/DiagnosticSnapshot";

function readJsonFile<T>(relativePath: string): T {
  const fullPath = path.resolve(__dirname, `../${relativePath}`);
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJsonFile(relativePath: string, data: unknown): void {
  const fullPath = path.resolve(__dirname, `../${relativePath}`);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function getScenarioFileName(): string {
  const arg = process.argv[2];
  return arg && arg.trim().length > 0
    ? arg.trim()
    : "sample_restaurant_week.json";
}

function getArtifactBaseName(fileName: string): string {
  return fileName.replace(/\.json$/i, "");
}

function loadPayload(fileName: string): OperationalIntakePayload {
  return readJsonFile<OperationalIntakePayload>(
    `10_examples/intake_payloads/${fileName}`
  );
}

function loadDiagnosticArtifact(fileName: string): unknown {
  const baseName = getArtifactBaseName(fileName);
  return readJsonFile<unknown>(
    `10_examples/diagnostics/${baseName}.diagnostic.json`
  );
}

function loadWeeklyReportArtifact(fileName: string): WeeklyReport {
  const baseName = getArtifactBaseName(fileName);
  return readJsonFile<WeeklyReport>(
    `10_examples/weekly_reports/${baseName}.report.json`
  );
}

function resolveDiagnosticSnapshotArtifact(
  diagnosticArtifact: unknown
): DiagnosticSnapshot {
  if (
    diagnosticArtifact &&
    typeof diagnosticArtifact === "object" &&
    !Array.isArray(diagnosticArtifact)
  ) {
    const direct = diagnosticArtifact as Record<string, unknown>;

    if (typeof direct.snapshotId === "string") {
      return diagnosticArtifact as DiagnosticSnapshot;
    }

    const nestedSnapshot = direct.snapshot;
    if (
      nestedSnapshot &&
      typeof nestedSnapshot === "object" &&
      !Array.isArray(nestedSnapshot)
    ) {
      const nested = nestedSnapshot as Record<string, unknown>;
      if (typeof nested.snapshotId === "string") {
        return nestedSnapshot as DiagnosticSnapshot;
      }
    }
  }

  throw new Error(
    "Diagnostic artifact must be either a snapshot object or an object containing snapshot."
  );
}

function runCommand(command: string): { passed: boolean; output: string } {
  try {
    const output = execSync(command, {
      cwd: path.resolve(__dirname, ".."),
      encoding: "utf-8",
      stdio: "pipe",
    });
    return { passed: true, output };
  } catch (error: unknown) {
    const err = error as { stdout?: unknown; stderr?: unknown };
    const stdout = err?.stdout ? String(err.stdout) : "";
    const stderr = err?.stderr ? String(err.stderr) : "";
    return {
      passed: false,
      output: `${stdout}\n${stderr}`.trim(),
    };
  }
}

function deriveCandidateReviewStatus(output: string, passed: boolean): string {
  if (!passed) return "failed";
  if (output.includes("Mismatches: 0")) return "passed_0_mismatches";
  if (output.includes("Mismatches:")) return "passed_with_mismatches";
  return "passed_status_unknown";
}

function buildValidationContext(): BundleValidationContext {
  const typecheck = runCommand("npm run typecheck");
  const baselineContrast = runCommand("npm run phase1:contrast");
  const contractsCheck = runCommand("npm run phase2:contracts-check");
  const candidateReview = runCommand("npm run phase2:candidates");

  return {
    typecheckPassed: typecheck.passed,
    baselineContrastPassed: baselineContrast.passed,
    contractsCheckPassed: contractsCheck.passed,
    candidateReviewStatus: deriveCandidateReviewStatus(
      candidateReview.output,
      candidateReview.passed
    ),
    executedAt: new Date().toISOString(),
  };
}

function buildBundle(params: {
  scenarioFile: string;
  runtimeResult: RunDiagnosticResult;
  diagnosticArtifact: unknown;
  weeklyReportArtifact: WeeklyReport;
  validationContext: BundleValidationContext;
}): DiagnosticRunBundle {
  const {
    scenarioFile,
    runtimeResult,
    diagnosticArtifact,
    weeklyReportArtifact,
    validationContext,
  } = params;

  const snapshotArtifact = resolveDiagnosticSnapshotArtifact(diagnosticArtifact);
  const reportId = weeklyReportArtifact.reportId;

  return {
    bundleType: "diagnostic_run_bundle",
    bundleVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    scenarioFile,
    unitKey: runtimeResult.snapshot.unitKey,
    normalizedPayload: runtimeResult.normalizedPayload,
    metrics: runtimeResult.metrics,
    signals: runtimeResult.signals,
    twin: runtimeResult.twin,
    snapshot: runtimeResult.snapshot,
    weeklyReport: weeklyReportArtifact,
    artifacts: {
      diagnosticArtifact: {
        artifactType: "diagnostic_snapshot_artifact",
        artifactPath: `10_examples/diagnostics/${getArtifactBaseName(scenarioFile)}.diagnostic.json`,
        generationStatus: "present",
        artifactSnapshotId: snapshotArtifact.snapshotId,
      },
      weeklyReportArtifact: {
        artifactType: "weekly_report_artifact",
        artifactPath: `10_examples/weekly_reports/${getArtifactBaseName(scenarioFile)}.report.json`,
        generationStatus: "present",
        artifactReportId: reportId,
      },
    },
    validation: validationContext,
  };
}

function main(): void {
  const scenarioFile = getScenarioFileName();
  const payload = loadPayload(scenarioFile);
  const runtimeResult: RunDiagnosticResult = runDiagnostic(payload);

  const diagnosticArtifact = loadDiagnosticArtifact(scenarioFile);
  const weeklyReportArtifact = loadWeeklyReportArtifact(scenarioFile);
  const validationContext = buildValidationContext();

  const bundle = buildBundle({
    scenarioFile,
    runtimeResult,
    diagnosticArtifact,
    weeklyReportArtifact,
    validationContext,
  });

  const outputPath = `10_examples/bundles/${getArtifactBaseName(scenarioFile)}.bundle.json`;
  writeJsonFile(outputPath, bundle);

  const reportId = bundle.weeklyReport.reportId;

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 2 BUNDLE ASSEMBLY");
  console.log("--------------------------------------------------");
  console.log(`Scenario File: ${scenarioFile}`);
  console.log(`Bundle Type: ${bundle.bundleType}`);
  console.log(`Bundle Version: ${bundle.bundleVersion}`);
  console.log(`Twin ID: ${runtimeResult.twin.twinId}`);
  console.log(`Snapshot ID: ${runtimeResult.snapshot.snapshotId}`);
  console.log(`Report ID: ${reportId}`);
  console.log("");
  console.log("Validation Context:");
  console.log(`- typecheckPassed: ${bundle.validation.typecheckPassed}`);
  console.log(
    `- baselineContrastPassed: ${bundle.validation.baselineContrastPassed}`
  );
  console.log(
    `- contractsCheckPassed: ${bundle.validation.contractsCheckPassed}`
  );
  console.log(
    `- candidateReviewStatus: ${bundle.validation.candidateReviewStatus}`
  );
  console.log("");
  console.log(`Bundle File: ${path.resolve(__dirname, `../${outputPath}`)}`);
  console.log("--------------------------------------------------");
}

main();
import fs from "fs";
import path from "path";
import { OperationalIntakePayload } from "../02_contracts/OperationalIntakePayload";
import { runDiagnostic } from "../05_engine/orchestration/run_diagnostic";
import { buildWeeklyReport } from "../05_engine/reporting/weekly/weekly_report_builder";

function getInputFileName(): string {
  const arg = process.argv[2];
  return arg && arg.trim().length > 0
    ? arg.trim()
    : "sample_restaurant_week.json";
}

function stripJsonExtension(fileName: string): string {
  return fileName.endsWith(".json") ? fileName.slice(0, -5) : fileName;
}

function main(): void {
  const inputFileName = getInputFileName();
  const inputBaseName = stripJsonExtension(inputFileName);

  const payloadPath = path.resolve(
    __dirname,
    `../10_examples/intake_payloads/${inputFileName}`
  );

  const diagnosticsDir = path.resolve(
    __dirname,
    "../10_examples/diagnostics"
  );

  const weeklyReportsDir = path.resolve(
    __dirname,
    "../10_examples/weekly_reports"
  );

  const diagnosticFilePath = path.join(
    diagnosticsDir,
    `${inputBaseName}.diagnostic.json`
  );

  const weeklyReportFilePath = path.join(
    weeklyReportsDir,
    `${inputBaseName}.report.json`
  );

  const raw = fs.readFileSync(payloadPath, "utf-8");
  const payload = JSON.parse(raw) as OperationalIntakePayload;

  const diagnosticResult = runDiagnostic(payload);
  const weeklyReport = buildWeeklyReport({
    twin: diagnosticResult.twin,
    snapshot: diagnosticResult.snapshot,
  });

  const activeSignals = diagnosticResult.signals
    .filter((signal) => signal.active)
    .map((signal) => `${signal.code} [${signal.severity}]`);

  const activeConstraints = diagnosticResult.snapshot.constraints
    .filter((constraint) => constraint.active)
    .map((constraint) => `${constraint.code} [${constraint.severity}]`);

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 1 DEMO SUMMARY");
  console.log("--------------------------------------------------");
  console.log(`Scenario File: ${inputFileName}`);
  console.log(`Payload ID: ${payload.payloadId}`);
  console.log(`Site: ${payload.siteId} - ${payload.siteName}`);
  console.log(
    `Operational Week: ${payload.operationalWeek.weekStart} to ${payload.operationalWeek.weekEnd}`
  );
  console.log("");
  console.log(`State: ${diagnosticResult.twin.stateLabel}`);
  console.log(`Decision: ${diagnosticResult.twin.decisionOutput.decisionLabel}`);
  console.log(`Priority: ${diagnosticResult.twin.decisionOutput.priority}`);
  console.log("");
  console.log(
    `Active Signals: ${activeSignals.length > 0 ? activeSignals.join(" | ") : "none"}`
  );
  console.log(
    `Active Constraints: ${activeConstraints.length > 0 ? activeConstraints.join(" | ") : "none"}`
  );
  console.log("");
  console.log(`Executive Summary: ${weeklyReport.executiveSummary}`);
  console.log("");
  console.log(`Diagnostic Artifact: ${diagnosticFilePath}`);
  console.log(`Weekly Report Artifact: ${weeklyReportFilePath}`);
  console.log("--------------------------------------------------");
}

main();
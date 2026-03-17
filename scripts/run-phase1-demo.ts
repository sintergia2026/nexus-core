import fs from "fs";
import path from "path";
import { OperationalIntakePayload } from "../02_contracts/OperationalIntakePayload";
import { runDiagnostic } from "../05_engine/orchestration/run_diagnostic";
import { buildWeeklyReport } from "../05_engine/reporting/weekly/weekly_report_builder";

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

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

  ensureDir(diagnosticsDir);
  ensureDir(weeklyReportsDir);

  const raw = fs.readFileSync(payloadPath, "utf-8");
  const payload = JSON.parse(raw) as OperationalIntakePayload;

  const diagnosticResult = runDiagnostic(payload);
  const weeklyReport = buildWeeklyReport({
    twin: diagnosticResult.twin,
    snapshot: diagnosticResult.snapshot,
  });

  const diagnosticOutput = {
    normalizedPayload: diagnosticResult.normalizedPayload,
    metrics: diagnosticResult.metrics,
    signals: diagnosticResult.signals,
    twin: diagnosticResult.twin,
    snapshot: diagnosticResult.snapshot,
  };

  const fullOutput = {
    ...diagnosticOutput,
    weeklyReport,
  };

  const diagnosticFilePath = path.join(
    diagnosticsDir,
    `${inputBaseName}.diagnostic.json`
  );

  const weeklyReportFilePath = path.join(
    weeklyReportsDir,
    `${inputBaseName}.report.json`
  );

  writeJsonFile(diagnosticFilePath, diagnosticOutput);
  writeJsonFile(weeklyReportFilePath, weeklyReport);

  console.log(JSON.stringify(fullOutput, null, 2));
  console.log("");
  console.log(`Diagnostic file written to: ${diagnosticFilePath}`);
  console.log(`Weekly report file written to: ${weeklyReportFilePath}`);
}

main();
import fs from "fs";
import path from "path";
import { OperationalIntakePayload } from "../../02_contracts/OperationalIntakePayload";
import { runDiagnostic } from "../../05_engine/orchestration/run_diagnostic";
import { buildWeeklyReport } from "../../05_engine/reporting/weekly/weekly_report_builder";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

export function runPhase1IntegrationTest(): void {
  const payloadPath = path.resolve(
    __dirname,
    "../../10_examples/intake_payloads/sample_restaurant_week.json"
  );

  const raw = fs.readFileSync(payloadPath, "utf-8");
  const payload = JSON.parse(raw) as OperationalIntakePayload;

  const diagnosticResult = runDiagnostic(payload);
  const weeklyReport = buildWeeklyReport({
    twin: diagnosticResult.twin,
    snapshot: diagnosticResult.snapshot,
  });

  assert(
    diagnosticResult.metrics.length === 6,
    "Phase 1 should produce exactly 6 metrics."
  );

  assert(
    diagnosticResult.twin.twinId.length > 0,
    "Twin must have a valid twinId."
  );

  assert(
    diagnosticResult.snapshot.snapshotId.length > 0,
    "Snapshot must have a valid snapshotId."
  );

  assert(
    weeklyReport.reportId.length > 0,
    "Weekly report must have a valid reportId."
  );

  assert(
    ["stable", "fragile", "constrained", "degraded", "recovering"].includes(
      diagnosticResult.twin.stateLabel
    ),
    "Twin stateLabel must be one of the allowed values."
  );

  assert(
    weeklyReport.sections.length === 5,
    "Weekly report must contain exactly 5 sections."
  );

  assert(
    weeklyReport.reportType === "weekly_report",
    "Weekly report type must be weekly_report."
  );

  assert(
    diagnosticResult.snapshot.diagnosticType === "weekly_operational_diagnostic",
    "Diagnostic snapshot type must be weekly_operational_diagnostic."
  );

  console.log("Phase 1 integration test passed.");
  console.log(`Twin ID: ${diagnosticResult.twin.twinId}`);
  console.log(`Snapshot ID: ${diagnosticResult.snapshot.snapshotId}`);
  console.log(`Report ID: ${weeklyReport.reportId}`);
  console.log(`State Label: ${diagnosticResult.twin.stateLabel}`);
}
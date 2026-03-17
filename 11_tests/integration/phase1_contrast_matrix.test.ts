import fs from "fs";
import path from "path";
import { OperationalIntakePayload } from "../../02_contracts/OperationalIntakePayload";
import { runDiagnostic } from "../../05_engine/orchestration/run_diagnostic";
import { buildWeeklyReport } from "../../05_engine/reporting/weekly/weekly_report_builder";

type ExpectedState = "stable" | "fragile" | "constrained" | "degraded" | "recovering";
type ExpectedDecision =
  | "monitor_and_preserve"
  | "corrective_focus"
  | "stabilize_now";
type ExpectedPriority = "P1" | "P2" | "P3";

interface ScenarioManifestEntry {
  scenarioId: string;
  fileName: string;
  sectorType: string;
  siteId: string;
  siteName: string;
  classification: string;
  expectedState: ExpectedState;
  expectedDecision: ExpectedDecision;
  expectedPriority: ExpectedPriority;
  purpose: string;
  status: string;
  locked: boolean;
}

interface ScenarioManifest {
  manifestVersion: string;
  phase: string;
  purpose: string;
  scenarios: ScenarioManifestEntry[];
}

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function loadScenarioManifest(): ScenarioManifest {
  const manifestPath = path.resolve(
    __dirname,
    "../../10_examples/intake_payloads/scenario_manifest.json"
  );

  const raw = fs.readFileSync(manifestPath, "utf-8");
  return JSON.parse(raw) as ScenarioManifest;
}

function loadPayload(fileName: string): OperationalIntakePayload {
  const payloadPath = path.resolve(
    __dirname,
    `../../10_examples/intake_payloads/${fileName}`
  );

  const raw = fs.readFileSync(payloadPath, "utf-8");
  return JSON.parse(raw) as OperationalIntakePayload;
}

function runScenario(entry: ScenarioManifestEntry): void {
  const payload = loadPayload(entry.fileName);

  const diagnosticResult = runDiagnostic(payload);
  const weeklyReport = buildWeeklyReport({
    twin: diagnosticResult.twin,
    snapshot: diagnosticResult.snapshot,
  });

  assert(
    diagnosticResult.twin.stateLabel === entry.expectedState,
    `${entry.fileName}: expected state ${entry.expectedState} but got ${diagnosticResult.twin.stateLabel}`
  );

  assert(
    diagnosticResult.twin.decisionOutput.decisionLabel === entry.expectedDecision,
    `${entry.fileName}: expected decision ${entry.expectedDecision} but got ${diagnosticResult.twin.decisionOutput.decisionLabel}`
  );

  assert(
    diagnosticResult.twin.decisionOutput.priority === entry.expectedPriority,
    `${entry.fileName}: expected priority ${entry.expectedPriority} but got ${diagnosticResult.twin.decisionOutput.priority}`
  );

  assert(
    weeklyReport.twinId === diagnosticResult.twin.twinId,
    `${entry.fileName}: weekly report twinId does not match diagnostic twinId`
  );

  assert(
    weeklyReport.snapshotId === diagnosticResult.snapshot.snapshotId,
    `${entry.fileName}: weekly report snapshotId does not match diagnostic snapshotId`
  );

  console.log(
    `[PASS] ${entry.fileName} -> state=${diagnosticResult.twin.stateLabel}, decision=${diagnosticResult.twin.decisionOutput.decisionLabel}, priority=${diagnosticResult.twin.decisionOutput.priority}`
  );
}

function validateManifest(manifest: ScenarioManifest): void {
  assert(
    manifest.phase === "Phase 1",
    `Expected manifest phase to be "Phase 1" but got "${manifest.phase}"`
  );

  assert(
    manifest.scenarios.length > 0,
    "Scenario manifest must contain at least one scenario."
  );
}

export function runPhase1ContrastMatrixTest(): void {
  const manifest = loadScenarioManifest();
  validateManifest(manifest);

  const baselineScenarios = manifest.scenarios.filter(
    (entry) => entry.status === "validated" && entry.locked === true
  );

  assert(
    baselineScenarios.length > 0,
    "Scenario manifest must contain at least one validated locked scenario."
  );

  baselineScenarios.forEach(runScenario);

  console.log("");
  console.log(
    `Phase 1 contrast matrix test passed for ${baselineScenarios.length} locked baseline scenario(s).`
  );
}

export function runPhase1ContrastAllValidatedTest(): void {
  const manifest = loadScenarioManifest();
  validateManifest(manifest);

  const allValidatedScenarios = manifest.scenarios.filter(
    (entry) => entry.status === "validated"
  );

  assert(
    allValidatedScenarios.length > 0,
    "Scenario manifest must contain at least one validated scenario."
  );

  allValidatedScenarios.forEach(runScenario);

  console.log("");
  console.log(
    `Phase 1 contrast all test passed for ${allValidatedScenarios.length} validated scenario(s).`
  );
}
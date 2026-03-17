import fs from "fs";
import path from "path";
import { OperationalIntakePayload } from "../02_contracts/OperationalIntakePayload";
import { runDiagnostic } from "../05_engine/orchestration/run_diagnostic";

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
  observedState?: ExpectedState;
  observedDecision?: ExpectedDecision;
  observedPriority?: ExpectedPriority;
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

function loadScenarioManifest(): ScenarioManifest {
  const manifestPath = path.resolve(
    __dirname,
    "../10_examples/intake_payloads/scenario_manifest.json"
  );

  const raw = fs.readFileSync(manifestPath, "utf-8");
  return JSON.parse(raw) as ScenarioManifest;
}

function loadPayload(fileName: string): OperationalIntakePayload {
  const payloadPath = path.resolve(
    __dirname,
    `../10_examples/intake_payloads/${fileName}`
  );

  const raw = fs.readFileSync(payloadPath, "utf-8");
  return JSON.parse(raw) as OperationalIntakePayload;
}

function sameTriple(
  entry: ScenarioManifestEntry,
  observedState: string,
  observedDecision: string,
  observedPriority: string
): boolean {
  return (
    entry.expectedState === observedState &&
    entry.expectedDecision === observedDecision &&
    entry.expectedPriority === observedPriority
  );
}

function main(): void {
  const manifest = loadScenarioManifest();
  const candidates = manifest.scenarios.filter((entry) => entry.status === "candidate");

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 2 CANDIDATE REVIEW");
  console.log("--------------------------------------------------");
  console.log(`Manifest Phase: ${manifest.phase}`);
  console.log(`Candidate Scenarios: ${candidates.length}`);
  console.log("");

  if (candidates.length === 0) {
    console.log("No candidate scenarios found.");
    console.log("--------------------------------------------------");
    return;
  }

  let mismatchCount = 0;

  for (const entry of candidates) {
    const payload = loadPayload(entry.fileName);
    const diagnosticResult = runDiagnostic(payload);

    const observedState = diagnosticResult.twin.stateLabel;
    const observedDecision = diagnosticResult.twin.decisionOutput.decisionLabel;
    const observedPriority = diagnosticResult.twin.decisionOutput.priority;

    const matches = sameTriple(
      entry,
      observedState,
      observedDecision,
      observedPriority
    );

    if (!matches) mismatchCount += 1;

    console.log(`Scenario: ${entry.fileName}`);
    console.log(`Classification: ${entry.classification}`);
    console.log(`Expected: ${entry.expectedState} / ${entry.expectedDecision} / ${entry.expectedPriority}`);
    console.log(`Observed: ${observedState} / ${observedDecision} / ${observedPriority}`);
    console.log(`Result: ${matches ? "MATCH" : "MISMATCH"}`);
    console.log("");
  }

  console.log(`Candidate review completed. Mismatches: ${mismatchCount}`);
  console.log("--------------------------------------------------");
}

main();
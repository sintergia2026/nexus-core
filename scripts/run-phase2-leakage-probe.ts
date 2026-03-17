import fs from "fs";
import path from "path";
import { OperationalIntakePayload } from "../02_contracts/OperationalIntakePayload";
import { runDiagnostic } from "../05_engine/orchestration/run_diagnostic";

interface ScenarioManifestEntry {
  scenarioId: string;
  fileName: string;
  classification: string;
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

function main(): void {
  const manifest = loadScenarioManifest();

  const leakageCandidates = manifest.scenarios.filter(
    (entry) =>
      entry.status === "candidate" &&
      entry.classification.includes("leakage")
  );

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 2 LEAKAGE PROBE");
  console.log("--------------------------------------------------");
  console.log(`Leakage candidate scenarios: ${leakageCandidates.length}`);
  console.log("");

  if (leakageCandidates.length === 0) {
    console.log("No leakage candidate scenarios found.");
    console.log("--------------------------------------------------");
    return;
  }

  for (const entry of leakageCandidates) {
    const payload = loadPayload(entry.fileName);
    const result = runDiagnostic(payload);

    const leakageSignal = result.signals.find(
      (signal) => signal.code === "leakage_signal"
    );

    const activeConstraints = result.snapshot.constraints.filter(
      (constraint) => constraint.active
    );

    const hypotheticalEconomicEscalation =
      leakageSignal?.active === true && leakageSignal.severity === "CRITICAL";

    const hypotheticalInterpretation = hypotheticalEconomicEscalation
      ? "If an economic/control constraint existed, this scenario would likely justify stronger structural propagation review."
      : "No hypothetical economic escalation triggered.";

    console.log(`Scenario: ${entry.fileName}`);
    console.log(`Current State: ${result.twin.stateLabel}`);
    console.log(`Current Decision: ${result.twin.decisionOutput.decisionLabel}`);
    console.log(`Current Priority: ${result.twin.decisionOutput.priority}`);
    console.log(
      `Leakage Signal: ${
        leakageSignal
          ? `${leakageSignal.active ? "active" : "inactive"} / ${leakageSignal.severity}`
          : "not_found"
      }`
    );
    console.log(
      `Active Constraints: ${
        activeConstraints.length > 0
          ? activeConstraints
              .map((constraint) => `${constraint.code} [${constraint.severity}]`)
              .join(" | ")
          : "none"
      }`
    );
    console.log(
      `Hypothetical Economic Escalation Flag: ${
        hypotheticalEconomicEscalation ? "ON" : "OFF"
      }`
    );
    console.log(`Probe Note: ${hypotheticalInterpretation}`);
    console.log("");
  }

  console.log("Probe completed. No core logic was modified.");
  console.log("--------------------------------------------------");
}

main();
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

type SimulatedState = "recovering" | "constrained" | "degraded";
type SimulatedDecision =
  | "monitor_and_preserve"
  | "corrective_focus"
  | "stabilize_now";
type SimulatedPriority = "P1" | "P2" | "P3";

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

function simulateOutcome(params: {
  currentState: string;
  currentDecision: string;
  currentPriority: string;
  leakageCritical: boolean;
  activeConstraintCount: number;
  hasCoordinationConstraint: boolean;
}): {
  simulatedState: SimulatedState;
  simulatedDecision: SimulatedDecision;
  simulatedPriority: SimulatedPriority;
  simulatedEconomicConstraint: boolean;
  note: string;
} {
  const {
    currentState,
    currentDecision,
    currentPriority,
    leakageCritical,
    activeConstraintCount,
    hasCoordinationConstraint,
  } = params;

  if (!leakageCritical) {
    return {
      simulatedState: currentState as SimulatedState,
      simulatedDecision: currentDecision as SimulatedDecision,
      simulatedPriority: currentPriority as SimulatedPriority,
      simulatedEconomicConstraint: false,
      note: "No simulation change applied because leakage is not CRITICAL.",
    };
  }

  const simulatedEconomicConstraint = true;

  if (activeConstraintCount === 0) {
    return {
      simulatedState: "constrained",
      simulatedDecision: "corrective_focus",
      simulatedPriority: "P2",
      simulatedEconomicConstraint,
      note: "Critical isolated leakage was promoted to a constrained corrective posture via hypothetical economic/control constraint.",
    };
  }

  if (hasCoordinationConstraint) {
    return {
      simulatedState: "constrained",
      simulatedDecision: "corrective_focus",
      simulatedPriority: "P2",
      simulatedEconomicConstraint,
      note: "Critical leakage plus coordination noise was softened from degraded to constrained under a more proportional economic/control propagation hypothesis.",
    };
  }

  return {
    simulatedState: "constrained",
    simulatedDecision: "corrective_focus",
    simulatedPriority: "P2",
    simulatedEconomicConstraint,
    note: "Critical leakage with existing structural friction was normalized to a constrained corrective posture in the simulation.",
  };
}

function main(): void {
  const manifest = loadScenarioManifest();

  const leakageCandidates = manifest.scenarios.filter(
    (entry) =>
      entry.status === "candidate" &&
      entry.classification.includes("leakage")
  );

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 2 LEAKAGE SIMULATION");
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

    const hasCoordinationConstraint = activeConstraints.some(
      (constraint) => constraint.code === "coordination"
    );

    const simulation = simulateOutcome({
      currentState: result.twin.stateLabel,
      currentDecision: result.twin.decisionOutput.decisionLabel,
      currentPriority: result.twin.decisionOutput.priority,
      leakageCritical:
        leakageSignal?.active === true && leakageSignal.severity === "CRITICAL",
      activeConstraintCount: activeConstraints.length,
      hasCoordinationConstraint,
    });

    console.log(`Scenario: ${entry.fileName}`);
    console.log(
      `Current: ${result.twin.stateLabel} / ${result.twin.decisionOutput.decisionLabel} / ${result.twin.decisionOutput.priority}`
    );
    console.log(
      `Simulated: ${simulation.simulatedState} / ${simulation.simulatedDecision} / ${simulation.simulatedPriority}`
    );
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
      `Hypothetical Economic Constraint: ${
        simulation.simulatedEconomicConstraint ? "ON" : "OFF"
      }`
    );
    console.log(`Simulation Note: ${simulation.note}`);
    console.log("");
  }

  console.log("Simulation completed. Core logic was not modified.");
  console.log("--------------------------------------------------");
}

main();
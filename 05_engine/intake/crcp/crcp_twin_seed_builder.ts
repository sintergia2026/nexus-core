import { CrcpDiagnosticSnapshot } from "../../types/CrcpDiagnosticSnapshot";
import { CrcpTwinSeed } from "../../types/CrcpTwinSeed";

function buildTwinSeedId(snapshot: CrcpDiagnosticSnapshot): string {
  return [
    "twin_seed",
    snapshot.context.organization_id,
    snapshot.context.sector,
    Date.now().toString(),
  ].join("::");
}

function deriveStructuralHypothesis(snapshot: CrcpDiagnosticSnapshot): string {
  const signalCodes = snapshot.active_signals.map((signal) => signal.code);
  const constraintCodes = snapshot.active_constraints.map(
    (constraint) => constraint.code
  );

  if (
    signalCodes.includes("reporting_gap_signal") &&
    constraintCodes.includes("reporting_visibility_constraint")
  ) {
    return "The client is operating with weak reporting visibility, which is likely obscuring operational and financial control gaps.";
  }

  if (signalCodes.includes("operational_instability_signal")) {
    return "The client shows signs of operational instability driven by execution inconsistency, dependency, or process friction.";
  }

  if (signalCodes.includes("financial_stress_signal")) {
    return "The client shows financial fragility that may be driven by weak control over margins, cash pressure, or cost volatility.";
  }

  return "The client requires further observation to refine the structural hypothesis.";
}

export function buildCrcpTwinSeed(
  snapshot: CrcpDiagnosticSnapshot
): CrcpTwinSeed {
  return {
    twin_seed_id: buildTwinSeedId(snapshot),
    context: snapshot.context,
    baseline_state: {
      state_label: snapshot.state_label,
      scores: snapshot.scores,
    },
    active_signals: snapshot.active_signals,
    active_constraints: snapshot.active_constraints,
    structural_hypothesis: deriveStructuralHypothesis(snapshot),
    created_at: new Date().toISOString(),
  };
}
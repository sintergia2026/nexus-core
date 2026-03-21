import { CrcpDiagnosticSnapshot } from "../../types/CrcpDiagnosticSnapshot";
import { CrcpTwinSeed } from "../../types/CrcpTwinSeed";

function sanitizeSegment(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sanitizeTimestamp(timestamp: string): string {
  return String(timestamp || new Date().toISOString())
    .replace(/[:.]/g, "-")
    .replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function buildTwinSeedId(snapshot: CrcpDiagnosticSnapshot): string {
  const organizationId = sanitizeSegment(
    snapshot.context.organization_id || "unknown-org"
  );
  const sector = sanitizeSegment(snapshot.context.sector || "unknown-sector");
  const subsector = sanitizeSegment(
    snapshot.context.subsector || "unknown-subsector"
  );
  const createdAt = sanitizeTimestamp(snapshot.created_at);

  return [
    "twin_seed",
    organizationId,
    sector,
    subsector,
    createdAt,
  ].join("::");
}

function deriveStructuralHypothesis(snapshot: CrcpDiagnosticSnapshot): string {
  const signalCodes = snapshot.active_signals.map((signal) => signal.code);
  const constraintCodes = snapshot.active_constraints.map(
    (constraint) => constraint.code
  );

  const stateLabel = snapshot.state_label;
  const {
    operational_maturity,
    financial_pressure,
    reporting_reliability,
    structural_risk,
    commercial_strength,
  } = snapshot.scores;

  if (signalCodes.includes("multi_domain_fragility_signal")) {
    return "The client is showing multi-domain fragility across visibility, structure, and financial control. This suggests the business is not facing an isolated weakness, but a systemic degradation pattern in which multiple control layers are deteriorating at the same time.";
  }

  if (
    signalCodes.includes("visibility_risk_compound_signal") &&
    constraintCodes.includes("reporting_visibility_constraint") &&
    constraintCodes.includes("structural_fragility_constraint")
  ) {
    return "The client is operating under compounded visibility and structural fragility. Weak reporting reliability is likely obscuring execution instability, limiting traceability, and preventing management from identifying the true origin of operational and financial deterioration.";
  }

  if (
    signalCodes.includes("reporting_gap_signal") &&
    constraintCodes.includes("reporting_visibility_constraint")
  ) {
    return "The client is operating with weak reporting visibility, which is likely obscuring operational and financial control gaps. Until visibility becomes reliable, downstream scores should be treated as structurally constrained rather than fully trustworthy.";
  }

  if (
    signalCodes.includes("operational_instability_signal") &&
    constraintCodes.includes("execution_standardization_constraint")
  ) {
    return "The client shows operational instability driven by inconsistent execution, process friction, or dependence on non-standardized work. The system likely lacks enough procedural stability to support scalable performance.";
  }

  if (
    signalCodes.includes("financial_stress_signal") &&
    constraintCodes.includes("financial_control_constraint")
  ) {
    return "The client shows financial fragility driven by weak cash control, poor visibility into margins, or unstable cost behavior. Financial stress appears structural rather than incidental.";
  }

  if (
    signalCodes.includes("commercial_weakness_signal") &&
    constraintCodes.includes("commercial_instability_constraint")
  ) {
    return "The client shows commercial weakness linked to unstable demand quality, weak conversion consistency, or poor alignment between sales activity and operating capacity.";
  }

  if (
    stateLabel === "critical" &&
    reporting_reliability < 45 &&
    structural_risk < 45
  ) {
    return "The client is in a critical structural condition. Both reporting reliability and structural resilience are weak, which suggests the organization is managing under low visibility and high systemic fragility.";
  }

  if (
    stateLabel === "fragile" &&
    operational_maturity < 55 &&
    financial_pressure < 55
  ) {
    return "The client is in a fragile state where execution maturity and financial control remain insufficient to guarantee stable performance. The organization may still be functioning, but under preventable structural pressure.";
  }

  if (stateLabel === "degraded" && operational_maturity < 65) {
    return "The client is degraded rather than collapsed. Core business activity exists, but structural discipline, planning consistency, or cross-functional coordination likely remain below the threshold required for resilient scaling.";
  }

  if (
    stateLabel === "stable" &&
    commercial_strength >= 60 &&
    reporting_reliability >= 60
  ) {
    return "The client shows a relatively stable structural baseline with usable visibility and acceptable commercial strength. The next layer of work should focus on optimization and controlled performance expansion rather than emergency stabilization.";
  }

  return "The client requires further observation to refine the structural hypothesis, but current diagnostic evidence suggests that structural performance is being shaped by a combination of visibility quality, execution maturity, financial control, and demand stability.";
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
    created_at: snapshot.created_at,
  };
}
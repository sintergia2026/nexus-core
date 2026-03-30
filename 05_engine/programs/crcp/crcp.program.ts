import { TwinStructure } from "../../types/TwinStructure";
import { CrcpProgram } from "./crcp.types";
import { evaluateCrcpProgram } from "./crcp.evaluator";

export function buildCrcpProgram(twin: TwinStructure): CrcpProgram {
  const evaluation = evaluateCrcpProgram(twin);

  return {
    program_id: "crcp_risk_containment_track",
    program_label: "CRCP Risk Containment Track",
    status: "active",
    recommended_priority:
      twin.activation.recommended_priority,
    current_phase: evaluation.current_phase,
    target_state: "stable",
    target_domains: evaluation.target_domains,
    actions: evaluation.actions,
    rationale: evaluation.rationale,
    generated_at: new Date().toISOString(),
  };
}
import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";
import { CrcpNormalizedPayload } from "../../types/CrcpNormalizedPayload";
import { CrcpBaselineScores } from "../../types/CrcpBaselineScores";
import { CrcpDecision } from "../../types/CrcpDecision";
import { CrcpDiagnosticSnapshot } from "../../types/CrcpDiagnosticSnapshot";
import { CrcpTwinSeed } from "../../types/CrcpTwinSeed";

import { normalizeCrcpIntake } from "./crcp_normalizer";
import { computeCrcpBaselineScores } from "./crcp_scoring_engine";
import { computeCrcpDecision } from "./crcp_decision_engine";
import { buildCrcpDiagnosticSnapshot } from "./crcp_snapshot_builder";
import { buildCrcpTwinSeed } from "./crcp_twin_seed_builder";
import {
  CrcpPersistenceResult,
  persistCrcpArtifacts,
} from "./crcp_persistence";
import {
  validateCrcpIntake,
  CrcpValidationIssue,
} from "./crcp_intake_validator";

export interface CrcpRunResult {
  intake: CrcpIntakePayload;
  normalized: CrcpNormalizedPayload;
  scores: CrcpBaselineScores;
  decision: CrcpDecision;
  snapshot: CrcpDiagnosticSnapshot;
  twin_seed: CrcpTwinSeed;
  persisted?: CrcpPersistenceResult;
  executed_at: string;
}

export interface CrcpRunErrorResult {
  intake: CrcpIntakePayload;
  normalized: null;
  scores: null;
  decision: null;
  snapshot: null;
  twin_seed: null;
  persisted?: undefined;
  executed_at: string;
  validation_issues: CrcpValidationIssue[];
}

export type CrcpRunPipelineResult = CrcpRunResult | CrcpRunErrorResult;

export function runCrcp(
  payload: CrcpIntakePayload,
  options?: { persist?: boolean }
): CrcpRunPipelineResult {
  const validation = validateCrcpIntake(payload);

  if (!validation.ok) {
    return {
      intake: payload,
      normalized: null,
      scores: null,
      decision: null,
      snapshot: null,
      twin_seed: null,
      executed_at: new Date().toISOString(),
      validation_issues: validation.issues,
    };
  }

  const normalized = normalizeCrcpIntake(payload);
  const scores = computeCrcpBaselineScores(normalized);
  const decision = computeCrcpDecision(scores);
  const snapshot = buildCrcpDiagnosticSnapshot(payload, scores, decision);
  const twinSeed = buildCrcpTwinSeed(snapshot);

  const persisted = options?.persist
    ? persistCrcpArtifacts({
        intake: payload,
        snapshot,
        twinSeed,
      })
    : undefined;

  return {
    intake: payload,
    normalized,
    scores,
    decision,
    snapshot,
    twin_seed: twinSeed,
    persisted,
    executed_at: new Date().toISOString(),
  };
}
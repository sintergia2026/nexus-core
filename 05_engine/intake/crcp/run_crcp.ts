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

export interface CrcpRunResult {
  intake: CrcpIntakePayload;
  normalized: CrcpNormalizedPayload;
  scores: CrcpBaselineScores;
  decision: CrcpDecision;
  snapshot: CrcpDiagnosticSnapshot;
  twin_seed: CrcpTwinSeed;
  executed_at: string;
}

export function runCrcp(payload: CrcpIntakePayload): CrcpRunResult {
  const normalized = normalizeCrcpIntake(payload);
  const scores = computeCrcpBaselineScores(normalized);
  const decision = computeCrcpDecision(scores);
  const snapshot = buildCrcpDiagnosticSnapshot(payload, scores, decision);
  const twinSeed = buildCrcpTwinSeed(snapshot);

  return {
    intake: payload,
    normalized,
    scores,
    decision,
    snapshot,
    twin_seed: twinSeed,
    executed_at: new Date().toISOString(),
  };
}
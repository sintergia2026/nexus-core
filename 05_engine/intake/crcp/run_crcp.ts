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

function normalizePayloadForExecution(
  payload: CrcpIntakePayload
): CrcpIntakePayload {
  const safeContext = payload?.context ?? {
    organization_id: "",
    sector: "",
    subsector: "",
    country: "",
  };

  const safeAnswers = Array.isArray(payload?.answers) ? payload.answers : [];

  return {
    ...payload,
    context: {
      organization_id: String(safeContext.organization_id || "").trim(),
      sector: String(safeContext.sector || "").trim(),
      subsector: String(safeContext.subsector || "").trim(),
      country: String(safeContext.country || "").trim(),
    },
    captured_at:
      typeof payload?.captured_at === "string" &&
      payload.captured_at.trim().length > 0
        ? payload.captured_at
        : new Date().toISOString(),
    answers: safeAnswers.map((answer) => ({
      ...answer,
      question_id: String(answer?.question_id || "").trim(),
      section: String(answer?.section || "").trim(),
      value: answer?.value,
    })),
  };
}

export function runCrcp(
  payload: CrcpIntakePayload,
  options?: { persist?: boolean }
): CrcpRunPipelineResult {
  const intake = normalizePayloadForExecution(payload);
  const executedAt = new Date().toISOString();

  const validation = validateCrcpIntake(intake);

  if (!validation.ok) {
    return {
      intake,
      normalized: null,
      scores: null,
      decision: null,
      snapshot: null,
      twin_seed: null,
      executed_at: executedAt,
      validation_issues: validation.issues,
    };
  }

  const normalized = normalizeCrcpIntake(intake);
  const scores = computeCrcpBaselineScores(normalized);
  const decision = computeCrcpDecision(scores);
  const snapshot = buildCrcpDiagnosticSnapshot(intake, scores, decision);
  const twinSeed = buildCrcpTwinSeed(snapshot);

  const persisted = options?.persist
    ? persistCrcpArtifacts({
        intake,
        snapshot,
        twinSeed,
      })
    : undefined;

  return {
    intake,
    normalized,
    scores,
    decision,
    snapshot,
    twin_seed: twinSeed,
    persisted,
    executed_at: executedAt,
  };
}
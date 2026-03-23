import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";
import { CrcpNormalizedPayload } from "../../types/CrcpNormalizedPayload";
import { CrcpBaselineScores } from "../../types/CrcpBaselineScores";
import { CrcpDecision } from "../../types/CrcpDecision";
import { CrcpDiagnosticSnapshot } from "../../types/CrcpDiagnosticSnapshot";
import { CrcpTwinSeed } from "../../types/CrcpTwinSeed";
import { TwinSeedV2 } from "../../types/TwinSeedV2";
import { TwinStructure } from "../../types/TwinStructure";

import { normalizeCrcpIntake } from "./crcp_normalizer";
import { computeCrcpBaselineScores } from "./crcp_scoring_engine";
import { computeCrcpDecision } from "./crcp_decision_engine";
import { buildCrcpDiagnosticSnapshot } from "./crcp_snapshot_builder";
import { buildCrcpTwinSeed } from "./crcp_twin_seed_builder";
import { buildTwinSeedV2 } from "../../twin/builders/buildTwinSeedV2";
import { buildTwinStructure } from "../../twin/builders/buildTwinStructure";
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
  twin_seed_v2: TwinSeedV2;
  twin_structure: TwinStructure;
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
  twin_seed_v2: null;
  twin_structure: null;
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
    city: "",
  };

  const safeAnswers = Array.isArray(payload?.answers) ? payload.answers : [];
  const safeCity = typeof safeContext.city === "string" ? safeContext.city : "";

  return {
    ...payload,
    context: {
      organization_id: String(safeContext.organization_id || "").trim(),
      sector: String(safeContext.sector || "").trim(),
      subsector: String(safeContext.subsector || "").trim(),
      country: String(safeContext.country || "").trim(),
      city: safeCity.trim(),
    },
    captured_at:
      typeof payload?.captured_at === "string" &&
      payload.captured_at.trim().length > 0
        ? payload.captured_at.trim()
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
      twin_seed_v2: null,
      twin_structure: null,
      executed_at: executedAt,
      validation_issues: validation.issues,
    };
  }

  const normalized = normalizeCrcpIntake(intake);
  const scores = computeCrcpBaselineScores(normalized);
  const decision = computeCrcpDecision(scores);
  const snapshot = buildCrcpDiagnosticSnapshot(intake, scores, decision);
  const twinSeed = buildCrcpTwinSeed(snapshot);

  const twinSeedV2 = buildTwinSeedV2({
    snapshot: {
      context: {
        organization_id: snapshot.context.organization_id,
        sector: snapshot.context.sector,
        subsector: snapshot.context.subsector,
        country: snapshot.context.country,
        city: snapshot.context.city,
      },
      scores: {
        operational_maturity: snapshot.scores.operational_maturity,
        financial_pressure: snapshot.scores.financial_pressure,
        reporting_reliability: snapshot.scores.reporting_reliability,
        structural_risk: snapshot.scores.structural_risk,
        commercial_strength: snapshot.scores.commercial_strength,
      },
      decision: {
        decision_label: decision.decision_label,
        priority: decision.priority as "P1" | "P2" | "P3",
        readiness_level: decision.readiness_level as
          | "low"
          | "medium"
          | "high",
      },
      state_label: snapshot.state_label,
      active_signals: snapshot.active_signals,
      active_constraints: snapshot.active_constraints,
      created_at: snapshot.created_at,
    },
    structural_hypothesis: twinSeed.structural_hypothesis,
    answered_questions: intake.answers.length,
    total_questions: normalized.metrics.length,
  });

  const twinStructure = buildTwinStructure({
    twin_seed_v2: twinSeedV2,
    intake,
    normalized,
  });

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
    twin_seed_v2: twinSeedV2,
    twin_structure: twinStructure,
    persisted,
    executed_at: executedAt,
  };
}
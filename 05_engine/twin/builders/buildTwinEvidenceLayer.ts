import { TwinEvidenceItem, TwinEvidenceValue } from "../../types/TwinEvidenceItem";
import { TwinSeedV2 } from "../../types/TwinSeedV2";
import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";
import { CrcpNormalizedPayload } from "../../types/CrcpNormalizedPayload";
import { CRCP_QUESTION_TO_EVIDENCE_TYPE_MAP } from "../mappers/crcpQuestionToEvidenceTypeMap";

type BuildTwinEvidenceLayerInput = {
  twin_seed_v2: TwinSeedV2;
  intake?: CrcpIntakePayload;
  normalized?: CrcpNormalizedPayload;
  domain_id_by_name?: Record<string, string>;
  role_id_by_name?: Record<string, string>;
};

type EvidenceBinding = {
  evidence_type: string;
  label: string;
  linked_domain?: string;
  linked_role?: string;
};

function sanitizeSegment(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildEvidenceId(orgId: string, key: string): string {
  return `evidence::${sanitizeSegment(key)}::${sanitizeSegment(orgId)}`;
}

function normalizeEvidenceValue(value: unknown): TwinEvidenceValue {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.join(", ");
  return null;
}

export function buildTwinEvidenceLayer({
  twin_seed_v2,
  intake,
  normalized,
  domain_id_by_name = {},
  role_id_by_name = {},
}: BuildTwinEvidenceLayerInput): TwinEvidenceItem[] {
  const orgId = twin_seed_v2.context.organization_id;
  const now = new Date().toISOString();

  const summaryEvidence: TwinEvidenceItem[] = [
    {
      evidence_id: buildEvidenceId(orgId, "coverage"),
      evidence_type: "coverage",
      label: "Questionnaire Coverage",
      status: twin_seed_v2.twin_confidence.level,
      value: twin_seed_v2.evidence_summary.coverage_percent,
      rationale: "Coverage reflects answered canonical intake questions.",
      metadata: {
        answered_questions: twin_seed_v2.evidence_summary.answered_questions,
        total_questions: twin_seed_v2.evidence_summary.total_questions,
      },
      created_at: now,
      updated_at: now,
    },
    {
      evidence_id: buildEvidenceId(orgId, "confidence"),
      evidence_type: "confidence",
      label: "Twin Confidence",
      status: twin_seed_v2.twin_confidence.level,
      value: twin_seed_v2.twin_confidence.score,
      rationale: twin_seed_v2.twin_confidence.rationale,
      metadata: {
        level: twin_seed_v2.twin_confidence.level,
      },
      created_at: now,
      updated_at: now,
    },
    {
      evidence_id: buildEvidenceId(orgId, "gap"),
      evidence_type: "gap",
      label: "Primary Structural Gap",
      status: twin_seed_v2.twin_confidence.level,
      value: twin_seed_v2.gap_vector.gap_severity,
      source_metric: twin_seed_v2.gap_vector.weakest_dimension,
      rationale:
        "Gap severity is derived from the weakest structural dimension.",
      created_at: now,
      updated_at: now,
    },
  ];

  const intakeAnswers = Array.isArray(intake?.answers) ? intake.answers : [];
  const normalizedMetrics = Array.isArray(normalized?.metrics)
    ? normalized.metrics
    : [];

  const diagnosticEvidence: TwinEvidenceItem[] = intakeAnswers.map(
    (answer, index): TwinEvidenceItem => {
      const binding = CRCP_QUESTION_TO_EVIDENCE_TYPE_MAP[
        answer.question_id
      ] as EvidenceBinding | undefined;

      const metric = normalizedMetrics.find(
        (item) => item.question_id === answer.question_id
      );

      const domainName = binding?.linked_domain;
      const roleName = binding?.linked_role;

      return {
        evidence_id: buildEvidenceId(
          orgId,
          `question_${index + 1}_${answer.question_id}`
        ),
        evidence_type:
          (binding?.evidence_type as TwinEvidenceItem["evidence_type"]) ||
          "diagnostic_evidence",
        label: binding?.label || `Question Evidence — ${answer.question_id}`,
        status: "active",
        source_question_id: answer.question_id,
        linked_domain_id: domainName
          ? domain_id_by_name[domainName]
          : undefined,
        linked_role_id: roleName ? role_id_by_name[roleName] : undefined,
        source_metric: metric?.subdomain || metric?.domain,
        rationale: `Evidence generated from canonical intake answer ${answer.question_id}.`,
        value: normalizeEvidenceValue(answer.value),
        metadata: {
          section: answer.section,
          normalized_value: metric?.normalized_value,
          weight: metric?.weight,
        },
        created_at: now,
        updated_at: now,
      };
    }
  );

  return [...summaryEvidence, ...diagnosticEvidence];
}
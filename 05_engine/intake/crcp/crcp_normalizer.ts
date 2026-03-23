import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";
import {
  CrcpNormalizedPayload,
  NormalizedMetric,
} from "../../types/CrcpNormalizedPayload";
import { CrcpQuestion } from "../../types/CrcpQuestion";
import { loadCrcpQuestionBank } from "./crcp_question_registry";
import { normalizeValueByQuestionType } from "./crcp_normalization_rules";

function buildQuestionMap(questions: CrcpQuestion[]): Map<string, CrcpQuestion> {
  return new Map(
    questions.map((question) => [question.question_id, question] as const)
  );
}

function normalizeContext(payload: CrcpIntakePayload) {
  return {
    organization_id: String(payload.context?.organization_id || "").trim(),
    sector: String(payload.context?.sector || "").trim(),
    subsector: String(payload.context?.subsector || "").trim(),
    country: String(payload.context?.country || "").trim(),
    city: String(payload.context?.city || "").trim(),
  };
}

export function normalizeCrcpIntake(
  payload: CrcpIntakePayload
): CrcpNormalizedPayload {
  const questionBank = loadCrcpQuestionBank() as CrcpQuestion[];
  const questionMap = buildQuestionMap(questionBank);

  const seenQuestionIds = new Set<string>();

  const metrics: NormalizedMetric[] = (Array.isArray(payload.answers)
    ? payload.answers
    : []
  )
    .map((answer) => {
      const questionId = String(answer?.question_id || "").trim();

      if (!questionId || seenQuestionIds.has(questionId)) {
        return null;
      }

      const question = questionMap.get(questionId);

      if (!question) {
        return null;
      }

      seenQuestionIds.add(questionId);

      const normalizedValue = normalizeValueByQuestionType(
        question,
        answer.value
      );

      return {
        question_id: question.question_id,
        domain: question.domain,
        subdomain: question.subdomain,
        normalized_value: normalizedValue,
        raw_value: answer.value,
        weight: question.weight,
      };
    })
    .filter((metric): metric is NormalizedMetric => metric !== null);

  return {
    context: normalizeContext(payload),
    metrics,
    normalized_at: new Date().toISOString(),
  };
}
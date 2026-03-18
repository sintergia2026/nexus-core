import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";
import {
  CrcpNormalizedPayload,
  NormalizedMetric,
} from "../../types/CrcpNormalizedPayload";
import { CrcpQuestion } from "../../types/CrcpQuestion";
import { loadCrcpQuestionBank } from "./crcp_question_registry";
import { normalizeValueByQuestionType } from "./crcp_normalization_rules";

function buildQuestionMap(questions: CrcpQuestion[]): Map<string, CrcpQuestion> {
  return new Map(questions.map((question) => [question.question_id, question]));
}

export function normalizeCrcpIntake(
  payload: CrcpIntakePayload
): CrcpNormalizedPayload {
  const questionBank = loadCrcpQuestionBank();
  const questionMap = buildQuestionMap(questionBank);

  const metrics: NormalizedMetric[] = payload.answers
    .map((answer) => {
      const question = questionMap.get(answer.question_id);

      if (!question) {
        return null;
      }

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
    context: payload.context,
    metrics,
    normalized_at: new Date().toISOString(),
  };
}
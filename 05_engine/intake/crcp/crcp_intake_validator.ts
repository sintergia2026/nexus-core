import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";
import questionBank from "../../../02_contracts/crcp_question_bank.json";
import subsectorProfiles from "../../../02_contracts/crcp_subsector_profiles.json";
import { selectCrcpQuestionsForSector } from "./crcp_sector_selector";

type QuestionBankItem = {
  question_id: string;
  text: string;
  domain: string;
  subdomain: string;
  type: string;
  weight: number;
  cross_sector: boolean;
  applicable_sectors: string[];
  scoring_direction?: string;
};

type SubsectorProfiles = Record<string, string[]>;

export type CrcpValidationIssue = {
  code: string;
  field: string;
  message: string;
};

export type CrcpValidationResult = {
  ok: boolean;
  issues: CrcpValidationIssue[];
};

const questionBankTyped = questionBank as QuestionBankItem[];
const subsectorProfilesTyped = subsectorProfiles as SubsectorProfiles;

function isBlank(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

function isValidScaleValue(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function isValidNumericValue(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidStringValue(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidMultiSelectValue(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return (
      value.length > 0 &&
      value.every((item) => typeof item === "string" && item.trim().length > 0)
    );
  }

  return false;
}

function hasDuplicateQuestionIds(payload: CrcpIntakePayload): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const answer of payload.answers) {
    if (seen.has(answer.question_id)) {
      duplicates.add(answer.question_id);
    }
    seen.add(answer.question_id);
  }

  return Array.from(duplicates);
}

function getQuestionById(questionId: string): QuestionBankItem | undefined {
  return questionBankTyped.find((q) => q.question_id === questionId);
}

function getExpectedQuestionIdsForSector(sector: string): string[] {
  const selection = selectCrcpQuestionsForSector(sector);

  return [
    ...(selection.identityQuestions ?? []),
    ...(selection.adaptiveQuestions ?? []),
  ];
}

export function validateCrcpIntake(
  payload: CrcpIntakePayload
): CrcpValidationResult {
  const issues: CrcpValidationIssue[] = [];

  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      issues: [
        {
          code: "INVALID_PAYLOAD",
          field: "payload",
          message: "CRCP intake payload is missing or invalid.",
        },
      ],
    };
  }

  if (!payload.context) {
    return {
      ok: false,
      issues: [
        {
          code: "MISSING_CONTEXT",
          field: "context",
          message: "CRCP intake context is required.",
        },
      ],
    };
  }

  const context = payload.context;

  if (!isValidStringValue(context.organization_id)) {
    issues.push({
      code: "MISSING_ORGANIZATION_ID",
      field: "context.organization_id",
      message: "organization_id is required.",
    });
  }

  if (!isValidStringValue(context.sector)) {
    issues.push({
      code: "MISSING_SECTOR",
      field: "context.sector",
      message: "sector is required.",
    });
  } else if (
    !Object.prototype.hasOwnProperty.call(subsectorProfilesTyped, context.sector)
  ) {
    issues.push({
      code: "INVALID_SECTOR",
      field: "context.sector",
      message: `sector "${context.sector}" is not part of the canonical CRCP sector set.`,
    });
  }

    if (!isValidStringValue(context.subsector)) {
    issues.push({
      code: "MISSING_SUBSECTOR",
      field: "context.subsector",
      message: "subsector is required.",
    });
  } else {
    const sectorKey = String(context.sector || "");
    const subsectorValue = String(context.subsector || "");
    const allowedSubsectors = subsectorProfilesTyped[sectorKey];

    if (
      isValidStringValue(context.sector) &&
      Array.isArray(allowedSubsectors) &&
      !allowedSubsectors.includes(subsectorValue)
    ) {
      issues.push({
        code: "INVALID_SUBSECTOR",
        field: "context.subsector",
        message: `subsector "${context.subsector}" is not valid for sector "${context.sector}".`,
      });
    }
  }

  if (!isValidStringValue(context.country)) {
    issues.push({
      code: "MISSING_COUNTRY",
      field: "context.country",
      message: "country is required.",
    });
  }

  if (!Array.isArray(payload.answers) || payload.answers.length === 0) {
    issues.push({
      code: "MISSING_ANSWERS",
      field: "answers",
      message: "At least one CRCP answer is required.",
    });
  }

  if (!payload.captured_at || Number.isNaN(Date.parse(payload.captured_at))) {
    issues.push({
      code: "INVALID_CAPTURED_AT",
      field: "captured_at",
      message: "captured_at must be a valid ISO timestamp.",
    });
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues,
    };
  }

  const duplicateIds = hasDuplicateQuestionIds(payload);

  for (const duplicateId of duplicateIds) {
    issues.push({
      code: "DUPLICATE_QUESTION_ID",
      field: `answers.${duplicateId}`,
      message: `Duplicate answer detected for question_id "${duplicateId}".`,
    });
  }

  const expectedQuestionIds = getExpectedQuestionIdsForSector(context.sector);
  const expectedQuestionIdSet = new Set(expectedQuestionIds);
  const answerMap = new Map(payload.answers.map((answer) => [answer.question_id, answer]));
  const answeredQuestionIds = new Set(payload.answers.map((answer) => answer.question_id));

  for (const expectedQuestionId of expectedQuestionIds) {
    if (!answerMap.has(expectedQuestionId)) {
      issues.push({
        code: "MISSING_REQUIRED_ANSWER",
        field: `answers.${expectedQuestionId}`,
        message: `Required answer "${expectedQuestionId}" is missing for sector "${context.sector}".`,
      });
    }
  }

  for (const answer of payload.answers) {
    const question = getQuestionById(answer.question_id);

    if (!question) {
      issues.push({
        code: "UNKNOWN_QUESTION_ID",
        field: `answers.${answer.question_id}`,
        message: `question_id "${answer.question_id}" does not exist in crcp_question_bank.json.`,
      });
      continue;
    }

    if (!expectedQuestionIdSet.has(answer.question_id)) {
      issues.push({
        code: "QUESTION_NOT_IN_CANONICAL_SELECTION",
        field: `answers.${answer.question_id}`,
        message: `question "${answer.question_id}" is not part of the canonical CRCP selection for sector "${context.sector}".`,
      });
    }

    if (isBlank(answer.section)) {
      issues.push({
        code: "MISSING_SECTION",
        field: `answers.${answer.question_id}.section`,
        message: `section is required for question "${answer.question_id}".`,
      });
    } else if (answer.section !== question.domain) {
      issues.push({
        code: "SECTION_DOMAIN_MISMATCH",
        field: `answers.${answer.question_id}.section`,
        message: `section "${answer.section}" does not match question domain "${question.domain}" for "${answer.question_id}".`,
      });
    }

    if (isBlank(answer.value)) {
      issues.push({
        code: "MISSING_VALUE",
        field: `answers.${answer.question_id}.value`,
        message: `value is required for question "${answer.question_id}".`,
      });
      continue;
    }

    if (
      !question.cross_sector &&
      !question.applicable_sectors.includes(context.sector)
    ) {
      issues.push({
        code: "QUESTION_NOT_APPLICABLE_TO_SECTOR",
        field: `answers.${answer.question_id}`,
        message: `question "${answer.question_id}" is not applicable to sector "${context.sector}".`,
      });
    }

    if (answer.question_id === "ID_01") {
      if (!isValidStringValue(answer.value)) {
        issues.push({
          code: "INVALID_BUSINESS_NAME",
          field: "answers.ID_01.value",
          message: "ID_01 must be a non-empty string.",
        });
      }
      continue;
    }

    if (answer.question_id === "ID_02") {
      const validSectorAnswer =
        Array.isArray(answer.value) &&
        answer.value.length === 1 &&
        answer.value[0] === context.sector;

      if (!validSectorAnswer) {
        issues.push({
          code: "INVALID_SECTOR_ANSWER",
          field: "answers.ID_02.value",
          message: "ID_02 must contain exactly the selected sector from context.",
        });
      }
      continue;
    }

    if (question.type === "scale_1_5" && !isValidScaleValue(answer.value)) {
      issues.push({
        code: "INVALID_SCALE_VALUE",
        field: `answers.${answer.question_id}.value`,
        message: `question "${answer.question_id}" must be an integer between 1 and 5.`,
      });
    }

    if (
      question.type === "yes_no" &&
      !(
        typeof answer.value === "string" &&
        ["yes", "no"].includes(answer.value.toLowerCase())
      )
    ) {
      issues.push({
        code: "INVALID_YES_NO_VALUE",
        field: `answers.${answer.question_id}.value`,
        message: `question "${answer.question_id}" must be "yes" or "no".`,
      });
    }

    if (question.type === "numeric" && !isValidNumericValue(answer.value)) {
      issues.push({
        code: "INVALID_NUMERIC_VALUE",
        field: `answers.${answer.question_id}.value`,
        message: `question "${answer.question_id}" must be numeric.`,
      });
    }

    if (question.type === "string" && !isValidStringValue(answer.value)) {
      issues.push({
        code: "INVALID_STRING_VALUE",
        field: `answers.${answer.question_id}.value`,
        message: `question "${answer.question_id}" must be a non-empty string.`,
      });
    }

    if (
      question.type === "multi_select" &&
      !isValidMultiSelectValue(answer.value)
    ) {
      issues.push({
        code: "INVALID_MULTI_SELECT_VALUE",
        field: `answers.${answer.question_id}.value`,
        message: `question "${answer.question_id}" must be a non-empty string or non-empty string array.`,
      });
    }
  }

  if (answeredQuestionIds.size !== expectedQuestionIds.length) {
    issues.push({
      code: "ANSWER_COUNT_MISMATCH",
      field: "answers",
      message: `Expected ${expectedQuestionIds.length} canonical answers for sector "${context.sector}", but received ${answeredQuestionIds.size} unique answers.`,
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}
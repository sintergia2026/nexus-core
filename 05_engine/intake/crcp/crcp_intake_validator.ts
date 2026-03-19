import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";
import questionBank from "../../../02_contracts/crcp_question_bank.json";
import subsectorProfiles from "../../../02_contracts/crcp_subsector_profiles.json";

type QuestionBankItem = {
  question_id: string;
  text: string;
  domain: string;
  subdomain: string;
  type: string;
  weight: number;
  cross_sector: boolean;
  applicable_sectors: string[];
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

const SCALE_QUESTION_IDS = new Set([
  "OPS_02",
  "OPS_06",
  "STF_06",
  "REP_02",
  "FIN_02",
  "SAL_02",
  "SAL_07",
  "CF_04",
  "PLN_04",
]);

const REQUIRED_QUESTION_IDS = [
  "ID_01",
  "ID_02",
  "OPS_01",
  "OPS_02",
  "OPS_06",
  "STF_01",
  "STF_06",
  "REP_02",
  "REP_06",
  "FIN_02",
  "FIN_03",
  "SAL_02",
  "SAL_07",
  "CF_04",
  "CF_05",
  "PLN_01",
  "PLN_04",
];

const YES_NO_QUESTION_IDS = new Set([
  "OPS_01",
  "REP_06",
  "FIN_03",
  "CF_05",
  "PLN_01",
]);

const BOOLEAN_QUESTION_IDS = new Set(["STF_01"]);

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
    issues.push({
      code: "MISSING_CONTEXT",
      field: "context",
      message: "CRCP intake context is required.",
    });
  }

  const context = payload.context;

  if (!context?.organization_id || context.organization_id.trim() === "") {
    issues.push({
      code: "MISSING_ORGANIZATION_ID",
      field: "context.organization_id",
      message: "organization_id is required.",
    });
  }

  if (!context?.sector || context.sector.trim() === "") {
    issues.push({
      code: "MISSING_SECTOR",
      field: "context.sector",
      message: "sector is required.",
    });
  } else if (!Object.keys(subsectorProfilesTyped).includes(context.sector)) {
    issues.push({
      code: "INVALID_SECTOR",
      field: "context.sector",
      message: `sector "${context.sector}" is not part of the canonical CRCP sector set.`,
    });
  }

  if (!context?.subsector || context.subsector.trim() === "") {
    issues.push({
      code: "MISSING_SUBSECTOR",
      field: "context.subsector",
      message: "subsector is required.",
    });
  } else if (
    context?.sector &&
    subsectorProfilesTyped[context.sector] &&
    !subsectorProfilesTyped[context.sector].includes(context.subsector)
  ) {
    issues.push({
      code: "INVALID_SUBSECTOR",
      field: "context.subsector",
      message: `subsector "${context.subsector}" is not valid for sector "${context.sector}".`,
    });
  }

  if (!context?.country || context.country.trim() === "") {
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

  const duplicateIds = hasDuplicateQuestionIds(payload);
  for (const duplicateId of duplicateIds) {
    issues.push({
      code: "DUPLICATE_QUESTION_ID",
      field: `answers.${duplicateId}`,
      message: `Duplicate answer detected for question_id "${duplicateId}".`,
    });
  }

  const answerMap = new Map(payload.answers.map((a) => [a.question_id, a]));

  for (const requiredQuestionId of REQUIRED_QUESTION_IDS) {
    if (!answerMap.has(requiredQuestionId)) {
      issues.push({
        code: "MISSING_REQUIRED_ANSWER",
        field: `answers.${requiredQuestionId}`,
        message: `Required answer "${requiredQuestionId}" is missing.`,
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

    if (isBlank(answer.section)) {
      issues.push({
        code: "MISSING_SECTION",
        field: `answers.${answer.question_id}.section`,
        message: `section is required for question "${answer.question_id}".`,
      });
    }

    if (answer.section !== question.domain) {
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
      context?.sector &&
      !question.applicable_sectors.includes(context.sector)
    ) {
      issues.push({
        code: "QUESTION_NOT_APPLICABLE_TO_SECTOR",
        field: `answers.${answer.question_id}`,
        message: `question "${answer.question_id}" is not applicable to sector "${context.sector}".`,
      });
    }

    if (
      SCALE_QUESTION_IDS.has(answer.question_id) &&
      !isValidScaleValue(answer.value)
    ) {
      issues.push({
        code: "INVALID_SCALE_VALUE",
        field: `answers.${answer.question_id}.value`,
        message: `question "${answer.question_id}" must be an integer between 1 and 5.`,
      });
    }

    if (
      YES_NO_QUESTION_IDS.has(answer.question_id) &&
      !["yes", "no"].includes(String(answer.value).toLowerCase())
    ) {
      issues.push({
        code: "INVALID_YES_NO_VALUE",
        field: `answers.${answer.question_id}.value`,
        message: `question "${answer.question_id}" must be "yes" or "no".`,
      });
    }

    if (
      BOOLEAN_QUESTION_IDS.has(answer.question_id) &&
      typeof answer.value !== "boolean"
    ) {
      issues.push({
        code: "INVALID_BOOLEAN_VALUE",
        field: `answers.${answer.question_id}.value`,
        message: `question "${answer.question_id}" must be boolean.`,
      });
    }

    if (answer.question_id === "ID_01" && typeof answer.value !== "string") {
      issues.push({
        code: "INVALID_BUSINESS_NAME",
        field: "answers.ID_01.value",
        message: "ID_01 must be a string.",
      });
    }

    if (
      answer.question_id === "ID_02" &&
      (!Array.isArray(answer.value) ||
        answer.value.length !== 1 ||
        answer.value[0] !== context?.sector)
    ) {
      issues.push({
        code: "INVALID_SECTOR_ANSWER",
        field: "answers.ID_02.value",
        message: "ID_02 must contain exactly the selected sector from context.",
      });
    }
  }

  if (!payload.captured_at || Number.isNaN(Date.parse(payload.captured_at))) {
    issues.push({
      code: "INVALID_CAPTURED_AT",
      field: "captured_at",
      message: "captured_at must be a valid ISO timestamp.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}
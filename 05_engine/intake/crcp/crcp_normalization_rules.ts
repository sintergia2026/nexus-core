import { CrcpQuestion } from "../../types/CrcpQuestion";
import { CrcpAnswerValue } from "../../types/CrcpIntakePayload";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function normalizePresenceBasedValue(value: CrcpAnswerValue): number {
  if (isNonEmptyString(value)) {
    return 100;
  }

  if (isNonEmptyStringArray(value)) {
    return 100;
  }

  if (typeof value === "boolean") {
    return value ? 100 : 0;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 0 ? 100 : 0;
  }

  return 0;
}

export function normalizeYesNo(value: CrcpAnswerValue): number {
  if (typeof value === "boolean") {
    return value ? 100 : 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "yes" || normalized === "true") {
      return 100;
    }

    if (normalized === "no" || normalized === "false") {
      return 0;
    }
  }

  return 0;
}

export function normalizeScale1To5(value: CrcpAnswerValue): number {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  const clamped = clamp(Math.round(numeric), 1, 5);
  return ((clamped - 1) / 4) * 100;
}

export function normalizeNumeric(value: CrcpAnswerValue): number {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  return 100;
}

export function normalizeMultiSelect(value: CrcpAnswerValue): number {
  return normalizePresenceBasedValue(value);
}

export function normalizeString(value: CrcpAnswerValue): number {
  return normalizePresenceBasedValue(value);
}

function invertIfNeeded(
  value: number,
  direction: CrcpQuestion["scoring_direction"]
): number {
  const safeValue = clamp(value, 0, 100);

  if (direction === "negative") {
    return 100 - safeValue;
  }

  return safeValue;
}

export function normalizeValueByQuestionType(
  question: CrcpQuestion,
  value: CrcpAnswerValue
): number {
  let normalized = 0;

  switch (question.type) {
    case "yes_no":
      normalized = normalizeYesNo(value);
      break;

    case "scale_1_5":
      normalized = normalizeScale1To5(value);
      break;

    case "numeric":
      normalized = normalizeNumeric(value);
      break;

    case "multi_select":
      normalized = normalizeMultiSelect(value);
      break;

    case "string":
      normalized = normalizeString(value);
      break;

    default:
      normalized = 0;
      break;
  }

  return invertIfNeeded(normalized, question.scoring_direction);
}
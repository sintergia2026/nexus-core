import { CrcpQuestion } from "../../types/CrcpQuestion";
import { CrcpAnswerValue } from "../../types/CrcpIntakePayload";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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

  const clamped = clamp(numeric, 1, 5);
  return ((clamped - 1) / 4) * 100;
}

export function normalizeNumeric(value: CrcpAnswerValue): number {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  if (numeric <= 0) {
    return 0;
  }

  if (numeric >= 100) {
    return 100;
  }

  return clamp(numeric, 0, 100);
}

export function normalizeMultiSelect(value: CrcpAnswerValue): number {
  if (!Array.isArray(value)) {
    return 0;
  }

  if (value.length === 0) {
    return 0;
  }

  const cappedLength = clamp(value.length, 1, 5);
  return (cappedLength / 5) * 100;
}

function invertIfNeeded(value: number, direction: CrcpQuestion["scoring_direction"]): number {
  if (direction === "negative") {
    return 100 - value;
  }

  return value;
}

export function normalizeValueByQuestionType(
  question: CrcpQuestion,
  value: CrcpAnswerValue
): number {
  let normalized: number;

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
      normalized = 0;
      break;

    default:
      normalized = 0;
      break;
  }

  return invertIfNeeded(normalized, question.scoring_direction);
}
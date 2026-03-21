import { NextRequest, NextResponse } from "next/server";
import { runCrcp } from "../../../../../../../../05_engine/intake/crcp/run_crcp";
import { CrcpIntakePayload } from "../../../../../../../../05_engine/types/CrcpIntakePayload";

const CANONICAL_SECTORS = new Set([
  "restaurant",
  "retail",
  "services",
  "construction",
  "health",
  "logistics",
  "technology",
  "education",
  "hospitality",
  "general",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidAnswerValue(value: unknown): boolean {
  if (typeof value === "string") {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(
      (item) => typeof item === "string" && item.trim().length > 0
    );
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const rawPayload = (await request.json()) as unknown;

    if (!isObject(rawPayload)) {
      return NextResponse.json(
        {
          ok: false,
          result: null,
          error: "Invalid CRCP payload: request body must be an object.",
        },
        { status: 400 }
      );
    }

    const rawContext = isObject(rawPayload.context) ? rawPayload.context : null;
    const rawAnswers = Array.isArray(rawPayload.answers)
      ? rawPayload.answers
      : null;

    if (!rawContext) {
      return NextResponse.json(
        {
          ok: false,
          result: null,
          error: 'Invalid CRCP payload: "context" is required.',
        },
        { status: 400 }
      );
    }

    if (!rawAnswers) {
      return NextResponse.json(
        {
          ok: false,
          result: null,
          error: 'Invalid CRCP payload: "answers" must be an array.',
        },
        { status: 400 }
      );
    }

    const organizationId = normalizeString(rawContext.organization_id);
    const sector = normalizeString(rawContext.sector);
    const subsector = normalizeString(rawContext.subsector);
    const country = normalizeString(rawContext.country);

    if (!organizationId) {
      return NextResponse.json(
        {
          ok: false,
          result: null,
          error: 'Invalid CRCP payload: "context.organization_id" is required.',
        },
        { status: 400 }
      );
    }

    if (!sector) {
      return NextResponse.json(
        {
          ok: false,
          result: null,
          error: 'Invalid CRCP payload: "context.sector" is required.',
        },
        { status: 400 }
      );
    }

    if (!CANONICAL_SECTORS.has(sector)) {
      return NextResponse.json(
        {
          ok: false,
          result: null,
          error: `Invalid CRCP payload: sector "${sector}" is not canonical.`,
        },
        { status: 400 }
      );
    }

    if (!subsector) {
      return NextResponse.json(
        {
          ok: false,
          result: null,
          error: 'Invalid CRCP payload: "context.subsector" is required.',
        },
        { status: 400 }
      );
    }

    if (!country) {
      return NextResponse.json(
        {
          ok: false,
          result: null,
          error: 'Invalid CRCP payload: "context.country" is required.',
        },
        { status: 400 }
      );
    }

    const normalizedAnswers = [];

    for (let index = 0; index < rawAnswers.length; index += 1) {
      const rawAnswer = rawAnswers[index];

      if (!isObject(rawAnswer)) {
        return NextResponse.json(
          {
            ok: false,
            result: null,
            error: `Invalid CRCP payload: answers[${index}] must be an object.`,
          },
          { status: 400 }
        );
      }

      const questionId = normalizeString(rawAnswer.question_id);
      const section = normalizeString(rawAnswer.section);
      const value = rawAnswer.value;

      if (!questionId) {
        return NextResponse.json(
          {
            ok: false,
            result: null,
            error: `Invalid CRCP payload: answers[${index}].question_id is required.`,
          },
          { status: 400 }
        );
      }

      if (!section) {
        return NextResponse.json(
          {
            ok: false,
            result: null,
            error: `Invalid CRCP payload: answers[${index}].section is required.`,
          },
          { status: 400 }
        );
      }

      if (!isValidAnswerValue(value)) {
        return NextResponse.json(
          {
            ok: false,
            result: null,
            error: `Invalid CRCP payload: answers[${index}].value has unsupported type.`,
          },
          { status: 400 }
        );
      }

      normalizedAnswers.push({
        question_id: questionId,
        section,
        value,
      });
    }

    const capturedAt =
      typeof rawPayload.captured_at === "string" &&
      rawPayload.captured_at.trim().length > 0
        ? rawPayload.captured_at.trim()
        : new Date().toISOString();

    const payload: CrcpIntakePayload = {
      context: {
        organization_id: organizationId,
        sector,
        subsector,
        country,
      },
      answers: normalizedAnswers,
      captured_at: capturedAt,
    };

    const result = runCrcp(payload, { persist: true });

    if ("validation_issues" in result) {
      return NextResponse.json(
        {
          ok: false,
          result,
          error: "CRCP intake validation failed.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        result,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        result: null,
        error:
          error instanceof Error
            ? error.message
            : "Unknown CRCP execution error",
      },
      { status: 500 }
    );
  }
}
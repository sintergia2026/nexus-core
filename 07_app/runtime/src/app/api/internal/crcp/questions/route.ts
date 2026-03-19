import { NextRequest, NextResponse } from "next/server";
import { selectCrcpQuestionsForSector } from "../../../../../../../../05_engine/intake/crcp/crcp_sector_selector";
import { loadCrcpQuestionBank } from "../../../../../../../../05_engine/intake/crcp/crcp_question_registry";

type QuestionItem = {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = String(searchParams.get("sector") || "")
      .trim()
      .toLowerCase();

    if (!sector) {
      return NextResponse.json(
        {
          ok: false,
          result: null,
          error: "sector query parameter is required.",
        },
        { status: 400 }
      );
    }

    if (!CANONICAL_SECTORS.has(sector)) {
      return NextResponse.json(
        {
          ok: false,
          result: null,
          error: `sector "${sector}" is not canonical.`,
        },
        { status: 400 }
      );
    }

    const selection = selectCrcpQuestionsForSector(sector);
    const questionBank = loadCrcpQuestionBank() as QuestionItem[];

    const byId = new Map<string, QuestionItem>(
      questionBank.map((q) => [q.question_id, q])
    );

    const identityQuestions = (selection.identityQuestions || [])
      .map((questionId) => byId.get(questionId))
      .filter((q): q is QuestionItem => q !== undefined);

    const adaptiveQuestions = (selection.adaptiveQuestions || [])
      .map((questionId) => byId.get(questionId))
      .filter((q): q is QuestionItem => q !== undefined);

    return NextResponse.json({
      ok: true,
      result: {
        sector,
        identityQuestions,
        adaptiveQuestions,
        questionCount: identityQuestions.length + adaptiveQuestions.length,
      },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        result: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
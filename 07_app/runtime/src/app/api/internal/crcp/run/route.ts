import { NextRequest, NextResponse } from "next/server";
import { runCrcp } from "../../../../../../../../05_engine/intake/crcp/run_crcp";
import { CrcpIntakePayload } from "../../../../../../../../05_engine/types/CrcpIntakePayload";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CrcpIntakePayload;
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

    return NextResponse.json({
      ok: true,
      result,
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
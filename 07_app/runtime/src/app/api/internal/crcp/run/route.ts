import { NextRequest, NextResponse } from "next/server";
import { runCrcp } from "../../../../../../../../05_engine/intake/crcp/run_crcp";
import { CrcpIntakePayload } from "../../../../../../../../05_engine/types/CrcpIntakePayload";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CrcpIntakePayload;

    const result = runCrcp(body, { persist: true });

    return NextResponse.json(
      {
        ok: true,
        result,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown CRCP execution error";

    return NextResponse.json(
      {
        ok: false,
        result: null,
        error: message,
      },
      { status: 500 }
    );
  }
}
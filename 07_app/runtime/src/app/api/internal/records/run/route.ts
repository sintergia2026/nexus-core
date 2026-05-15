import { NextResponse } from "next/server";
import { runEngine } from "../../../../../../../../05_engine/orchestration/engine_orchestrator";
import type { OperationalIntakePayload } from "../../../../../../../../02_contracts/OperationalIntakePayload";
import type { PersistedBundleRecord } from "../../../../../../../../05_engine/types/PersistedBundleRecord";

interface EngineRunEnvelope {
  responseType: "engine_run";
  responseVersion: "1.0.0";
  dryRun: boolean;
  persisted: boolean;
  record: PersistedBundleRecord | null;
  supersededRecordId: string | null;
  executedAt: string;
  servedAt: string;
  error: { code: string; message: string; details?: unknown } | null;
}

function makeErrorEnvelope(
  code: string,
  message: string,
  dryRun: boolean,
  details?: unknown
): EngineRunEnvelope {
  return {
    responseType: "engine_run",
    responseVersion: "1.0.0",
    dryRun,
    persisted: false,
    record: null,
    supersededRecordId: null,
    executedAt: new Date().toISOString(),
    servedAt: new Date().toISOString(),
    error: details !== undefined ? { code, message, details } : { code, message },
  };
}

export async function POST(request: Request) {
  const servedAt = new Date().toISOString();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      makeErrorEnvelope("INVALID_JSON", "Request body must be valid JSON.", false),
      { status: 400 }
    );
  }

  const dryRun = typeof body.dryRun === "boolean" ? body.dryRun : false;

  if (!body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) {
    return NextResponse.json(
      makeErrorEnvelope("MISSING_PAYLOAD", "Request body must include a 'payload' object.", dryRun),
      { status: 400 }
    );
  }

  const payloadObj = body.payload as Record<string, unknown>;
  if (!payloadObj.payloadId || typeof payloadObj.payloadId !== "string") {
    return NextResponse.json(
      makeErrorEnvelope("INVALID_PAYLOAD_STRUCTURE", "payload.payloadId must be a non-empty string.", dryRun),
      { status: 400 }
    );
  }

  try {
    const result = await runEngine(body.payload as OperationalIntakePayload, {
      dryRun,
      scenarioFile: typeof body.scenarioFile === "string" ? body.scenarioFile : undefined,
    });

    const envelope: EngineRunEnvelope = {
      responseType: "engine_run",
      responseVersion: "1.0.0",
      dryRun: result.dryRun,
      persisted: !result.dryRun,
      record: result.record,
      supersededRecordId: result.supersededRecordId,
      executedAt: result.executedAt,
      servedAt,
      error: null,
    };

    return NextResponse.json(envelope, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.startsWith("INTEGRITY_VIOLATION")) {
      return NextResponse.json(
        makeErrorEnvelope("INTEGRITY_VIOLATION", "Engine detected multiple active records.", dryRun, { engineMessage: message }),
        { status: 409 }
      );
    }
    if (message.startsWith("INTEGRITY_FAILURE")) {
      return NextResponse.json(
        makeErrorEnvelope("INTEGRITY_FAILURE", "Record failed load-back verification after save.", dryRun, { engineMessage: message }),
        { status: 500 }
      );
    }
    return NextResponse.json(
      makeErrorEnvelope("ENGINE_ERROR", "Engine run failed.", dryRun, { engineMessage: message }),
      { status: 500 }
    );
  }
}

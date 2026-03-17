import {
  getActiveRecordByContextEnvelope,
  getActiveRecordSummaryByContextEnvelope,
} from "../../../../../05_engine/api/api_record_service";

function badRequest(message: string, details?: Record<string, unknown>): Response {
  return Response.json(
    {
      responseType: "single_record",
      responseVersion: "1.0.0",
      requestedContext: details ?? {},
      found: false,
      record: null,
      servedAt: new Date().toISOString(),
      error: {
        code: "BAD_REQUEST",
        message,
        details: details ?? {},
      },
    },
    { status: 400 }
  );
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);

  const organizationId = url.searchParams.get("organizationId") ?? "";
  const siteId = url.searchParams.get("siteId") ?? "";
  const weekId = url.searchParams.get("weekId") ?? "";
  const view = url.searchParams.get("view") ?? "full";

  if (!organizationId || !siteId || !weekId) {
    return badRequest(
      "Missing required query parameters: organizationId, siteId, weekId.",
      {
        organizationId,
        siteId,
        weekId,
        view,
      }
    );
  }

  const params = {
    organizationId,
    siteId,
    weekId,
  };

  const envelope =
    view === "summary"
      ? getActiveRecordSummaryByContextEnvelope(params)
      : getActiveRecordByContextEnvelope(params);

  const statusCode = envelope.error ? 404 : 200;

  return Response.json(envelope, { status: statusCode });
}
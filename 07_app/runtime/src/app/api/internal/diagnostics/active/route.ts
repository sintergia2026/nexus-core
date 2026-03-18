import { NextResponse } from "next/server";
import { getActiveDiagnosticByContext } from "@/lib/internal-records-client";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const organizationId = url.searchParams.get("organizationId") ?? "";
  const siteId = url.searchParams.get("siteId") ?? "";
  const weekId = url.searchParams.get("weekId") ?? "";

  if (!organizationId || !siteId || !weekId) {
    return NextResponse.json(
      {
        responseType: "active_diagnostic",
        responseVersion: "1.0.0",
        requestedContext: {
          organizationId,
          siteId,
          weekId,
        },
        found: false,
        diagnostic: null,
        servedAt: new Date().toISOString(),
        error: {
          code: "BAD_REQUEST",
          message: "Missing required query parameters: organizationId, siteId, weekId.",
        },
      },
      { status: 400 }
    );
  }

  const envelope = await getActiveDiagnosticByContext({
    organizationId,
    siteId,
    weekId,
  });

  return NextResponse.json(envelope, {
    status: envelope.error ? 404 : 200,
  });
}
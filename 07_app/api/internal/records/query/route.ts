import {
  queryRecordsEnvelope,
  queryRecordSummariesEnvelope,
} from "../../../../../05_engine/api/api_record_service";

function parseOptionalNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);

  const view = url.searchParams.get("view") ?? "full";

  const query = {
    persistedBundleId: url.searchParams.get("persistedBundleId") ?? undefined,
    organizationId: url.searchParams.get("organizationId") ?? undefined,
    siteId: url.searchParams.get("siteId") ?? undefined,
    sectorType: url.searchParams.get("sectorType") ?? undefined,
    weekId: url.searchParams.get("weekId") ?? undefined,
    calendarYear: parseOptionalNumber(url.searchParams.get("calendarYear")),
    weekNumber: parseOptionalNumber(url.searchParams.get("weekNumber")),
    snapshotId: url.searchParams.get("snapshotId") ?? undefined,
    twinId: url.searchParams.get("twinId") ?? undefined,
    reportId: url.searchParams.get("reportId") ?? undefined,
    recordStatus:
      (url.searchParams.get("recordStatus") as
        | "active"
        | "superseded"
        | "archived"
        | null) ?? undefined,
  };

  const envelope =
    view === "summary"
      ? queryRecordSummariesEnvelope(query)
      : queryRecordsEnvelope(query);

  return Response.json(envelope, { status: 200 });
}
import { NextResponse } from "next/server";
import { queryRecordSummaries } from "@/lib/internal-records-client";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const organizationId = url.searchParams.get("organizationId") ?? undefined;
  const siteId = url.searchParams.get("siteId") ?? undefined;
  const weekId = url.searchParams.get("weekId") ?? undefined;
  const recordStatus =
    (url.searchParams.get("recordStatus") as
      | "active"
      | "superseded"
      | "archived"
      | null) ?? undefined;

  const envelope = await queryRecordSummaries({
    organizationId,
    siteId,
    weekId,
    recordStatus,
  });

  return NextResponse.json(envelope, { status: 200 });
}
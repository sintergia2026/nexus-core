import { GET as getActiveRoute } from "../07_app/api/internal/records/active/route";
import { GET as getQueryRoute } from "../07_app/api/internal/records/query/route";
import { POST as postCompareRoute } from "../07_app/api/internal/records/compare/route";

async function readJsonResponse(response: Response): Promise<unknown> {
  return response.json();
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function testActiveSummaryRoute(): Promise<void> {
  const request = new Request(
    "http://localhost/internal/api/records/active?organizationId=org-sintergia-demo&siteId=site-004&weekId=site-004::2026-W11&view=summary",
    { method: "GET" }
  );

  const response = await getActiveRoute(request);
  const body = (await readJsonResponse(response)) as Record<string, unknown>;

  assert(response.status === 200, "Active summary route should return 200.");
  assert(
    body.responseType === "single_record_summary",
    "Active summary route should return single_record_summary."
  );
  assert(body.found === true, "Active summary route should return found=true.");
}

async function testQuerySummaryRoute(): Promise<void> {
  const request = new Request(
    "http://localhost/internal/api/records/query?siteId=site-004&view=summary",
    { method: "GET" }
  );

  const response = await getQueryRoute(request);
  const body = (await readJsonResponse(response)) as Record<string, unknown>;

  assert(response.status === 200, "Query summary route should return 200.");
  assert(
    body.responseType === "multi_record_summary",
    "Query summary route should return multi_record_summary."
  );
  assert(
    typeof body.resultCount === "number",
    "Query summary route should include numeric resultCount."
  );
}

async function testCompareRoute(): Promise<void> {
  const request = new Request(
    "http://localhost/internal/api/records/compare",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leftRecordId:
          "pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0001",
        rightRecordId:
          "pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0002",
      }),
    }
  );

  const response = await postCompareRoute(request);
  const body = (await readJsonResponse(response)) as Record<string, unknown>;

  assert(response.status === 200, "Compare route should return 200.");
  assert(
    body.responseType === "record_comparison",
    "Compare route should return record_comparison."
  );
  assert(
    typeof body.executiveReading === "string",
    "Compare route should include executiveReading."
  );
}

async function testActiveRouteBadRequest(): Promise<void> {
  const request = new Request(
    "http://localhost/internal/api/records/active?siteId=site-004",
    { method: "GET" }
  );

  const response = await getActiveRoute(request);
  const body = (await readJsonResponse(response)) as Record<string, unknown>;

  assert(response.status === 400, "Bad active route request should return 400.");
  assert(body.error !== null, "Bad active route request should include error.");
}

async function main(): Promise<void> {
  console.log("==================================================");
  console.log("NEXUS PHASE 4 ROUTE CONTRACT CHECK");
  console.log("==================================================");

  await testActiveSummaryRoute();
  console.log("[PASS] active summary route");

  await testQuerySummaryRoute();
  console.log("[PASS] query summary route");

  await testCompareRoute();
  console.log("[PASS] compare route");

  await testActiveRouteBadRequest();
  console.log("[PASS] active route bad request handling");

  console.log("==================================================");
  console.log("PHASE 4 ROUTE CONTRACT CHECK PASSED");
  console.log("==================================================");
}

main().catch((error) => {
  console.error("PHASE 4 ROUTE CONTRACT CHECK FAILED");
  console.error(error);
  process.exit(1);
});
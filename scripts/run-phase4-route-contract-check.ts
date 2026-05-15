import fs from "fs";
import os from "os";
import path from "path";

// Point all read tests at the canonical records directory.
// NEXUS_RECORDS_DIR must be set before any route module is loaded so that
// internal-records-client and query_persisted_record_index pick it up.
process.env["NEXUS_RECORDS_DIR"] = path.resolve(
  __dirname,
  "../10_examples/persisted_records"
);

import { GET as getActiveRoute } from "../07_app/runtime/src/app/api/internal/records/active/route";
import { GET as getQueryRoute } from "../07_app/runtime/src/app/api/internal/records/query/route";
import { POST as postCompareRoute } from "../07_app/runtime/src/app/api/internal/records/compare/route";
import { POST as postRunRoute } from "../07_app/runtime/src/app/api/internal/records/run/route";

async function readJsonResponse(response: Response): Promise<unknown> {
  return response.json();
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

// ── existing read-route tests ─────────────────────────────────────────────────

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

// ── run route tests ───────────────────────────────────────────────────────────

async function testRunRoutePersist(): Promise<void> {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "nexus-run-route-persist-")
  );
  const originalRecordsDir = process.env["NEXUS_RECORDS_DIR"];
  process.env["NEXUS_RECORDS_DIR"] = tempDir;

  try {
    const payloadPath = path.resolve(
      __dirname,
      "../10_examples/intake_payloads/sample_restaurant_week.json"
    );
    const payload = JSON.parse(fs.readFileSync(payloadPath, "utf-8")) as unknown;

    const request = new Request(
      "http://localhost/api/internal/records/run",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      }
    );

    const response = await postRunRoute(request);
    const body = (await readJsonResponse(response)) as Record<string, unknown>;
    const record = body.record as Record<string, unknown> | null;

    assert(
      response.status === 200,
      `Run route (persist) should return 200, got ${response.status}: ${JSON.stringify(body.error)}`
    );
    assert(body.responseType === "engine_run", "Run route should return responseType=engine_run.");
    assert(body.dryRun === false, "Run route persist should return dryRun=false.");
    assert(body.persisted === true, "Run route persist should return persisted=true.");
    assert(record !== null, "Run route persist should return a non-null record.");
    assert(body.error === null, "Run route persist should return error=null.");
    assert(
      typeof record?.["persistedBundleId"] === "string" &&
        (record["persistedBundleId"] as string).startsWith("pbr::"),
      `Run route record.persistedBundleId should start with "pbr::", got: ${record?.["persistedBundleId"]}`
    );
    const storageMeta = record?.["storageMeta"] as Record<string, unknown> | undefined;
    assert(
      storageMeta?.["integrityCheckStatus"] === "passed",
      `Run route record.storageMeta.integrityCheckStatus should be "passed", got: ${storageMeta?.["integrityCheckStatus"]}`
    );
  } finally {
    if (originalRecordsDir !== undefined) {
      process.env["NEXUS_RECORDS_DIR"] = originalRecordsDir;
    } else {
      delete process.env["NEXUS_RECORDS_DIR"];
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function testRunRouteDryRun(): Promise<void> {
  const payloadPath = path.resolve(
    __dirname,
    "../10_examples/intake_payloads/sample_restaurant_week.json"
  );
  const payload = JSON.parse(fs.readFileSync(payloadPath, "utf-8")) as unknown;

  const request = new Request(
    "http://localhost/api/internal/records/run",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, dryRun: true }),
    }
  );

  const response = await postRunRoute(request);
  const body = (await readJsonResponse(response)) as Record<string, unknown>;

  assert(
    response.status === 200,
    `Run route (dryRun) should return 200, got ${response.status}: ${JSON.stringify(body.error)}`
  );
  assert(body.responseType === "engine_run", "Run route dryRun should return responseType=engine_run.");
  assert(body.dryRun === true, "Run route dryRun should return dryRun=true.");
  assert(body.persisted === false, "Run route dryRun should return persisted=false.");
  assert(body.error === null, "Run route dryRun should return error=null.");
}

async function testRunRouteMissingPayload(): Promise<void> {
  const request = new Request(
    "http://localhost/api/internal/records/run",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dryRun: false }),
    }
  );

  const response = await postRunRoute(request);
  const body = (await readJsonResponse(response)) as Record<string, unknown>;
  const error = body.error as Record<string, unknown> | null;

  assert(response.status === 400, `Run route (missing payload) should return 400, got ${response.status}.`);
  assert(
    error?.["code"] === "MISSING_PAYLOAD",
    `Run route missing payload should return MISSING_PAYLOAD, got: ${error?.["code"]}`
  );
}

async function testRunRouteInvalidJson(): Promise<void> {
  const request = new Request(
    "http://localhost/api/internal/records/run",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json{{{",
    }
  );

  const response = await postRunRoute(request);
  const body = (await readJsonResponse(response)) as Record<string, unknown>;
  const error = body.error as Record<string, unknown> | null;

  assert(response.status === 400, `Run route (invalid JSON) should return 400, got ${response.status}.`);
  assert(
    error?.["code"] === "INVALID_JSON",
    `Run route invalid JSON should return INVALID_JSON, got: ${error?.["code"]}`
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

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

  await testRunRoutePersist();
  console.log("[PASS] run route (persist)");

  await testRunRouteDryRun();
  console.log("[PASS] run route (dry run)");

  await testRunRouteMissingPayload();
  console.log("[PASS] run route (missing payload → 400)");

  await testRunRouteInvalidJson();
  console.log("[PASS] run route (invalid JSON → 400)");

  console.log("==================================================");
  console.log("PHASE 4 ROUTE CONTRACT CHECK PASSED");
  console.log("==================================================");
}

main().catch((error) => {
  console.error("PHASE 4 ROUTE CONTRACT CHECK FAILED");
  console.error(error);
  process.exit(1);
});

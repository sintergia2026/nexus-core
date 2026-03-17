import {
  compareRecordsEnvelope,
  getActiveRecordByContextEnvelope,
  getActiveRecordSummaryByContextEnvelope,
  getRecordByIdEnvelope,
  getRecordSummaryByIdEnvelope,
  queryRecordsEnvelope,
  queryRecordSummariesEnvelope,
} from "../05_engine/api/api_record_service";

function main(): void {
  const activeEnvelope = getActiveRecordByContextEnvelope({
    organizationId: "org-sintergia-demo",
    siteId: "site-004",
    weekId: "site-004::2026-W11",
  });

  const activeSummaryEnvelope = getActiveRecordSummaryByContextEnvelope({
    organizationId: "org-sintergia-demo",
    siteId: "site-004",
    weekId: "site-004::2026-W11",
  });

  const exactEnvelope = getRecordByIdEnvelope(
    "pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0002"
  );

  const exactSummaryEnvelope = getRecordSummaryByIdEnvelope(
    "pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0002"
  );

  const queryEnvelope = queryRecordsEnvelope({
    siteId: "site-004",
  });

  const querySummaryEnvelope = queryRecordSummariesEnvelope({
    siteId: "site-004",
  });

  const comparisonEnvelope = compareRecordsEnvelope({
    leftRecordId:
      "pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0001",
    rightRecordId:
      "pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0002",
  });

  console.log("==================================================");
  console.log("NEXUS PHASE 4 API SERVICE DEMO");
  console.log("==================================================");
  console.log("");

  console.log("ACTIVE RECORD ENVELOPE");
  console.log(JSON.stringify(activeEnvelope, null, 2));
  console.log("");

  console.log("ACTIVE RECORD SUMMARY ENVELOPE");
  console.log(JSON.stringify(activeSummaryEnvelope, null, 2));
  console.log("");

  console.log("EXACT RECORD ENVELOPE");
  console.log(JSON.stringify(exactEnvelope, null, 2));
  console.log("");

  console.log("EXACT RECORD SUMMARY ENVELOPE");
  console.log(JSON.stringify(exactSummaryEnvelope, null, 2));
  console.log("");

  console.log("QUERY RECORDS ENVELOPE");
  console.log(JSON.stringify(queryEnvelope, null, 2));
  console.log("");

  console.log("QUERY RECORD SUMMARIES ENVELOPE");
  console.log(JSON.stringify(querySummaryEnvelope, null, 2));
  console.log("");

  console.log("COMPARISON ENVELOPE");
  console.log(JSON.stringify(comparisonEnvelope, null, 2));
  console.log("");

  console.log("==================================================");
}

main();
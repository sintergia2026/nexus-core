import { normalizeCrcpIntake } from "../05_engine/intake/crcp/crcp_normalizer";
import { CrcpIntakePayload } from "../05_engine/types/CrcpIntakePayload";

const samplePayload: CrcpIntakePayload = {
  context: {
    organization_id: "org-sintergia-demo",
    sector: "restaurant",
    subsector: "casual_dining",
    country: "CO",
  },
  answers: [
    { question_id: "ID_01", section: "identity", value: "Demo Restaurant" },
    { question_id: "ID_02", section: "identity", value: ["restaurant"] },
    { question_id: "OPS_01", section: "operations", value: "yes" },
    { question_id: "OPS_02", section: "operations", value: 3 },
    { question_id: "STF_01", section: "staffing", value: true },
    { question_id: "REP_02", section: "reporting", value: 2 },
    { question_id: "FIN_02", section: "finance", value: 4 },
    { question_id: "CF_02", section: "customer_flow", value: ["checkout", "wait_time"] },
    { question_id: "PLN_01", section: "planning", value: "no" }
  ],
  captured_at: new Date().toISOString(),
};

function main(): void {
  const normalized = normalizeCrcpIntake(samplePayload);

  console.log("==================================================");
  console.log("CRCP NORMALIZER CHECK");
  console.log("==================================================");
  console.log(`Organization: ${normalized.context.organization_id}`);
  console.log(`Sector: ${normalized.context.sector}`);
  console.log(`Normalized At: ${normalized.normalized_at}`);
  console.log(`Metrics Count: ${normalized.metrics.length}`);
  console.log("--------------------------------------------------");

  for (const metric of normalized.metrics) {
    console.log(
      `${metric.question_id} | ${metric.domain} | raw=${JSON.stringify(
        metric.raw_value
      )} | normalized=${metric.normalized_value} | weight=${metric.weight}`
    );
  }

  console.log("==================================================");
}

main();
import { normalizeCrcpIntake } from "../05_engine/intake/crcp/crcp_normalizer";
import { computeCrcpBaselineScores } from "../05_engine/intake/crcp/crcp_scoring_engine";
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
    { question_id: "OPS_06", section: "operations", value: 4 },

    { question_id: "STF_01", section: "staffing", value: true },
    { question_id: "STF_06", section: "staffing", value: 4 },

    { question_id: "REP_02", section: "reporting", value: 2 },
    { question_id: "REP_06", section: "reporting", value: "no" },

    { question_id: "FIN_02", section: "finance", value: 4 },
    { question_id: "FIN_03", section: "finance", value: "yes" },

    { question_id: "SAL_02", section: "sales", value: 3 },
    { question_id: "SAL_07", section: "sales", value: 4 },

    { question_id: "CF_04", section: "customer_flow", value: 4 },
    { question_id: "CF_05", section: "customer_flow", value: "yes" },

    { question_id: "PLN_01", section: "planning", value: "no" },
    { question_id: "PLN_04", section: "planning", value: 4 }
  ],
  captured_at: new Date().toISOString(),
};

function main(): void {
  const normalized = normalizeCrcpIntake(samplePayload);
  const scores = computeCrcpBaselineScores(normalized);

  console.log("==================================================");
  console.log("CRCP SCORING CHECK");
  console.log("==================================================");
  console.log(`Organization: ${samplePayload.context.organization_id}`);
  console.log(`Sector: ${samplePayload.context.sector}`);
  console.log("--------------------------------------------------");
  console.log(JSON.stringify(scores, null, 2));
  console.log("==================================================");
}

main();
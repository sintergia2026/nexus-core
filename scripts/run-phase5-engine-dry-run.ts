import fs from "fs";
import path from "path";
import { OperationalIntakePayload } from "../02_contracts/OperationalIntakePayload";
import { runEngine } from "../05_engine/orchestration/engine_orchestrator";

async function main(): Promise<void> {
  const payloadPath = path.resolve(
    __dirname,
    "../10_examples/intake_payloads/sample_restaurant_week.json"
  );
  const raw = fs.readFileSync(payloadPath, "utf-8");
  const payload = JSON.parse(raw) as OperationalIntakePayload;

  console.log("[phase5:engine-dry-run] Running engine in dry-run mode...");

  const result = await runEngine(payload, { dryRun: true });

  console.log("[phase5:engine-dry-run] Result:");
  console.log("  dryRun:             ", result.dryRun);
  console.log("  executedAt:         ", result.executedAt);
  console.log("  persistedBundleId:  ", result.record.persistedBundleId);
  console.log("  recordStatus:       ", result.record.recordStatus);
  console.log("  storedBy:           ", result.record.storageMeta.storedBy);
  console.log("  supersededRecordId: ", result.supersededRecordId);

  // Assertions
  if (result.dryRun !== true) {
    throw new Error("ASSERTION FAILED: dryRun must be true");
  }
  if (!result.record.persistedBundleId.startsWith("pbr::")) {
    throw new Error(
      `ASSERTION FAILED: persistedBundleId has unexpected prefix: ${result.record.persistedBundleId}`
    );
  }
  if (result.record.recordStatus !== "active") {
    throw new Error(
      `ASSERTION FAILED: recordStatus must be active, got: ${result.record.recordStatus}`
    );
  }
  if (result.record.storageMeta.storedBy !== "engine_orchestrator") {
    throw new Error(
      `ASSERTION FAILED: storedBy must be engine_orchestrator, got: ${result.record.storageMeta.storedBy}`
    );
  }

  console.log("[phase5:engine-dry-run] All assertions passed. No records written.");
}

main().catch((err) => {
  console.error("[phase5:engine-dry-run] FAILED:", err);
  process.exit(1);
});

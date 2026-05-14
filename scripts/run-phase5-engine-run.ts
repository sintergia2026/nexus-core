import fs from "fs";
import path from "path";
import os from "os";
import { OperationalIntakePayload } from "../02_contracts/OperationalIntakePayload";
import { runEngine } from "../05_engine/orchestration/engine_orchestrator";
import { FilesystemPersistenceAdapter } from "../05_engine/persistence/filesystem/FilesystemPersistenceAdapter";

async function main(): Promise<void> {
  const payloadPath = path.resolve(
    __dirname,
    "../10_examples/intake_payloads/sample_restaurant_week.json"
  );
  const raw = fs.readFileSync(payloadPath, "utf-8");
  const payload = JSON.parse(raw) as OperationalIntakePayload;

  // Use an isolated temp directory so this script never pollutes the canonical records store
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-phase5-run-"));
  const adapter = new FilesystemPersistenceAdapter(tempDir);

  console.log("[phase5:engine-run] Running engine with isolated adapter...");
  console.log("[phase5:engine-run] Temp directory:", tempDir);

  const result = await runEngine(payload, { adapter });

  console.log("[phase5:engine-run] Result:");
  console.log("  dryRun:             ", result.dryRun);
  console.log("  executedAt:         ", result.executedAt);
  console.log("  persistedBundleId:  ", result.record.persistedBundleId);
  console.log("  recordStatus:       ", result.record.recordStatus);
  console.log("  storedBy:           ", result.record.storageMeta.storedBy);
  console.log("  supersededRecordId: ", result.supersededRecordId);

  // Assertions
  if (result.dryRun !== false) {
    throw new Error("ASSERTION FAILED: dryRun must be false");
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

  // Verify the record was actually written by loading it back
  const loadResult = await adapter.loadByPersistedBundleId(
    result.record.persistedBundleId
  );
  if (!loadResult.found || loadResult.record === null) {
    throw new Error(
      `ASSERTION FAILED: record not found after save: ${result.record.persistedBundleId}`
    );
  }
  if (
    loadResult.record.persistedBundleId !== result.record.persistedBundleId
  ) {
    throw new Error(
      `ASSERTION FAILED: loaded record id mismatch: ` +
        `expected ${result.record.persistedBundleId}, got ${loadResult.record.persistedBundleId}`
    );
  }
  if (loadResult.record.storageMeta.storedBy !== "engine_orchestrator") {
    throw new Error(
      `ASSERTION FAILED: storedBy must be engine_orchestrator, got: ${loadResult.record.storageMeta.storedBy}`
    );
  }

  console.log("[phase5:engine-run] Load-back verification passed.");
  console.log("[phase5:engine-run] All assertions passed.");

  // Cleanup temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log("[phase5:engine-run] Temp directory cleaned up.");
}

main().catch((err) => {
  console.error("[phase5:engine-run] FAILED:", err);
  process.exit(1);
});

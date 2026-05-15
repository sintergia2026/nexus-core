import fs from "fs";
import path from "path";
import os from "os";
import { OperationalIntakePayload } from "../02_contracts/OperationalIntakePayload";
import { runEngine } from "../05_engine/orchestration/engine_orchestrator";

const SCENARIO_FILE = "run-phase5-engine-run";

async function main(): Promise<void> {
  const payloadPath = path.resolve(
    __dirname,
    "../10_examples/intake_payloads/sample_restaurant_week.json"
  );
  const raw = fs.readFileSync(payloadPath, "utf-8");
  const payload = JSON.parse(raw) as OperationalIntakePayload;

  // Isolated temp directory — never pollutes the canonical records store.
  // recordsDirectory aligns query/revision read paths with the adapter write path.
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-phase5-run-"));

  console.log("[phase5:engine-run] Running engine with isolated adapter...");
  console.log("[phase5:engine-run] Temp directory:", tempDir);

  const result = await runEngine(payload, {
    recordsDirectory: tempDir,
    scenarioFile: SCENARIO_FILE,
  });

  console.log("[phase5:engine-run] Result:");
  console.log("  dryRun:              ", result.dryRun);
  console.log("  executedAt:          ", result.executedAt);
  console.log("  persistedBundleId:   ", result.record.persistedBundleId);
  console.log("  recordStatus:        ", result.record.recordStatus);
  console.log("  storedBy:            ", result.record.storageMeta.storedBy);
  console.log("  integrityCheckStatus:", result.record.storageMeta.integrityCheckStatus);
  console.log("  scenarioFile:        ", result.record.bundle.scenarioFile);
  console.log("  artifactPath[diag]:  ", result.record.bundle.artifacts.diagnosticArtifact.artifactPath);
  console.log("  supersededRecordId:  ", result.supersededRecordId);

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
  if (result.record.storageMeta.storedBy !== "engine_orchestrator") {
    throw new Error(
      `ASSERTION FAILED: storedBy must be engine_orchestrator, got: ${result.record.storageMeta.storedBy}`
    );
  }
  if (result.record.storageMeta.integrityCheckStatus !== "passed") {
    throw new Error(
      `ASSERTION FAILED: integrityCheckStatus must be "passed", got: "${result.record.storageMeta.integrityCheckStatus}"`
    );
  }
  if (result.record.bundle.scenarioFile !== SCENARIO_FILE) {
    throw new Error(
      `ASSERTION FAILED: scenarioFile must be "${SCENARIO_FILE}", got: "${result.record.bundle.scenarioFile}"`
    );
  }
  if (result.record.bundle.artifacts.diagnosticArtifact.artifactPath !== "") {
    throw new Error(
      `ASSERTION FAILED: artifactPath must be "" (sub-artifacts not stored separately), ` +
        `got: "${result.record.bundle.artifacts.diagnosticArtifact.artifactPath}"`
    );
  }

  console.log("[phase5:engine-run] All assertions passed.");

  // Cleanup temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log("[phase5:engine-run] Temp directory cleaned up.");
}

main().catch((err) => {
  console.error("[phase5:engine-run] FAILED:", err);
  process.exit(1);
});

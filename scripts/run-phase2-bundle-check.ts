import fs from "fs";
import path from "path";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function readJsonFile<T>(relativePath: string): T {
  const fullPath = path.resolve(__dirname, `../${relativePath}`);
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

function getScenarioFileName(): string {
  const arg = process.argv[2];
  return arg && arg.trim().length > 0
    ? arg.trim()
    : "sample_restaurant_week_reporting_failure.json";
}

function getArtifactBaseName(fileName: string): string {
  return fileName.replace(/\.json$/i, "");
}

function loadBundle(fileName: string): any {
  const baseName = getArtifactBaseName(fileName);
  return readJsonFile<any>(
    `10_examples/bundles/${baseName}.bundle.json`
  );
}

function assertObjectExists(value: unknown, fieldPath: string): void {
  assert(
    typeof value === "object" && value !== null && !Array.isArray(value),
    `${fieldPath} must exist and be an object`
  );
}

function assertArrayExists(value: unknown, fieldPath: string): void {
  assert(Array.isArray(value), `${fieldPath} must exist and be an array`);
}

function assertFieldExists(
  obj: Record<string, unknown>,
  key: string,
  fieldPath: string
): void {
  assert(key in obj, `${fieldPath}.${key} is required`);
  assert(obj[key] !== undefined, `${fieldPath}.${key} must not be undefined`);
}

function assertRequiredFields(
  obj: Record<string, unknown>,
  requiredKeys: string[],
  fieldPath: string
): void {
  for (const key of requiredKeys) {
    assertFieldExists(obj, key, fieldPath);
  }
}

function validateBundleTopLevel(bundle: any): void {
  assertObjectExists(bundle, "bundle");

  assertRequiredFields(
    bundle,
    [
      "bundleType",
      "bundleVersion",
      "generatedAt",
      "scenarioFile",
      "unitKey",
      "normalizedPayload",
      "metrics",
      "signals",
      "twin",
      "snapshot",
      "weeklyReport",
      "artifacts",
      "validation"
    ],
    "bundle"
  );

  assert(bundle.bundleType === "diagnostic_run_bundle", "bundle.bundleType must be diagnostic_run_bundle");
  assert(bundle.bundleVersion === "1.0.0", "bundle.bundleVersion must be 1.0.0");

  assertObjectExists(bundle.unitKey, "bundle.unitKey");
  assertObjectExists(bundle.normalizedPayload, "bundle.normalizedPayload");
  assertArrayExists(bundle.metrics, "bundle.metrics");
  assertArrayExists(bundle.signals, "bundle.signals");
  assertObjectExists(bundle.twin, "bundle.twin");
  assertObjectExists(bundle.snapshot, "bundle.snapshot");
  assertObjectExists(bundle.weeklyReport, "bundle.weeklyReport");
  assertObjectExists(bundle.artifacts, "bundle.artifacts");
  assertObjectExists(bundle.validation, "bundle.validation");
}

function validateArtifacts(bundle: any, scenarioFile: string): void {
  const baseName = getArtifactBaseName(scenarioFile);

  assertRequiredFields(
    bundle.artifacts,
    ["diagnosticArtifact", "weeklyReportArtifact"],
    "bundle.artifacts"
  );

  assertObjectExists(bundle.artifacts.diagnosticArtifact, "bundle.artifacts.diagnosticArtifact");
  assertObjectExists(bundle.artifacts.weeklyReportArtifact, "bundle.artifacts.weeklyReportArtifact");

  assertRequiredFields(
    bundle.artifacts.diagnosticArtifact,
    ["artifactType", "artifactPath", "generationStatus", "artifactSnapshotId"],
    "bundle.artifacts.diagnosticArtifact"
  );

  assertRequiredFields(
    bundle.artifacts.weeklyReportArtifact,
    ["artifactType", "artifactPath", "generationStatus", "artifactReportId"],
    "bundle.artifacts.weeklyReportArtifact"
  );

  assert(
    bundle.artifacts.diagnosticArtifact.artifactType === "diagnostic_snapshot_artifact",
    "bundle.artifacts.diagnosticArtifact.artifactType must be diagnostic_snapshot_artifact"
  );

  assert(
    bundle.artifacts.weeklyReportArtifact.artifactType === "weekly_report_artifact",
    "bundle.artifacts.weeklyReportArtifact.artifactType must be weekly_report_artifact"
  );

  assert(
    bundle.artifacts.diagnosticArtifact.artifactPath === `10_examples/diagnostics/${baseName}.diagnostic.json`,
    "diagnostic artifact path must match scenario artifact path"
  );

  assert(
    bundle.artifacts.weeklyReportArtifact.artifactPath === `10_examples/weekly_reports/${baseName}.report.json`,
    "weekly report artifact path must match scenario artifact path"
  );

  assert(
    bundle.artifacts.diagnosticArtifact.generationStatus === "present",
    "diagnostic artifact generationStatus must be present"
  );

  assert(
    bundle.artifacts.weeklyReportArtifact.generationStatus === "present",
    "weekly report artifact generationStatus must be present"
  );
}

function validateValidationBlock(bundle: any): void {
  assertRequiredFields(
    bundle.validation,
    [
      "typecheckPassed",
      "baselineContrastPassed",
      "contractsCheckPassed",
      "candidateReviewStatus"
    ],
    "bundle.validation"
  );
}

function validateReferentialIntegrity(bundle: any): void {
  assert(
    bundle.snapshot.twinId === bundle.twin.twinId,
    "bundle.snapshot.twinId must match bundle.twin.twinId"
  );

  assert(
    bundle.twin.snapshotRef === bundle.snapshot.snapshotId,
    "bundle.twin.snapshotRef must match bundle.snapshot.snapshotId"
  );

  assert(
    bundle.weeklyReport.snapshotId === bundle.snapshot.snapshotId,
    "bundle.weeklyReport.snapshotId must match bundle.snapshot.snapshotId"
  );

  assert(
    bundle.weeklyReport.twinId === bundle.twin.twinId,
    "bundle.weeklyReport.twinId must match bundle.twin.twinId"
  );

  assert(
    bundle.artifacts.diagnosticArtifact.artifactSnapshotId === bundle.snapshot.snapshotId,
    "diagnostic artifact snapshot ID must match bundle snapshot ID"
  );

  assert(
    bundle.artifacts.weeklyReportArtifact.artifactReportId === bundle.weeklyReport.reportId,
    "weekly report artifact report ID must match bundle weekly report ID"
  );

  assert(
    JSON.stringify(bundle.twin.unitKey) === JSON.stringify(bundle.snapshot.unitKey),
    "bundle.twin.unitKey must match bundle.snapshot.unitKey"
  );

  assert(
    JSON.stringify(bundle.snapshot.unitKey) === JSON.stringify(bundle.weeklyReport.unitKey),
    "bundle.snapshot.unitKey must match bundle.weeklyReport.unitKey"
  );

  assert(
    JSON.stringify(bundle.unitKey) === JSON.stringify(bundle.snapshot.unitKey),
    "bundle.unitKey must match bundle.snapshot.unitKey"
  );

  assert(
    bundle.snapshot.sourcePayloadIds.includes(bundle.normalizedPayload.payloadId),
    "bundle.snapshot.sourcePayloadIds must include bundle.normalizedPayload.payloadId"
  );

  assert(
    bundle.weeklyReport.linkedSnapshot.snapshotId === bundle.snapshot.snapshotId,
    "bundle.weeklyReport.linkedSnapshot.snapshotId must match bundle.snapshot.snapshotId"
  );

  assert(
    bundle.weeklyReport.linkedSnapshot.twinId === bundle.snapshot.twinId,
    "bundle.weeklyReport.linkedSnapshot.twinId must match bundle.snapshot.twinId"
  );

  assert(
    bundle.weeklyReport.linkedSnapshot.stateLabel === bundle.snapshot.stateLabel,
    "bundle.weeklyReport.linkedSnapshot.stateLabel must match bundle.snapshot.stateLabel"
  );
}

function main(): void {
  const scenarioFile = getScenarioFileName();
  const bundle = loadBundle(scenarioFile);

  validateBundleTopLevel(bundle);
  validateArtifacts(bundle, scenarioFile);
  validateValidationBlock(bundle);
  validateReferentialIntegrity(bundle);

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 2 BUNDLE CHECK");
  console.log("--------------------------------------------------");
  console.log(`Scenario File: ${scenarioFile}`);
  console.log(`[PASS] bundle top-level structure`);
  console.log(`[PASS] artifact linkage`);
  console.log(`[PASS] validation block presence`);
  console.log(`[PASS] referential integrity`);
  console.log("Bundle check passed.");
  console.log("--------------------------------------------------");
}

main();
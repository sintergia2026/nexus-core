import fs from "fs";
import path from "path";
import { runDiagnostic } from "../05_engine/orchestration/run_diagnostic";
import { OperationalIntakePayload } from "../02_contracts/OperationalIntakePayload";

interface ScenarioManifestEntry {
  scenarioId: string;
  fileName: string;
  classification: string;
  status: string;
  locked: boolean;
}

interface ScenarioManifest {
  manifestVersion: string;
  phase: string;
  purpose: string;
  scenarios: ScenarioManifestEntry[];
}

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

function loadScenarioManifest(): ScenarioManifest {
  return readJsonFile<ScenarioManifest>(
    "10_examples/intake_payloads/scenario_manifest.json"
  );
}

function loadPayload(fileName: string): OperationalIntakePayload {
  return readJsonFile<OperationalIntakePayload>(
    `10_examples/intake_payloads/${fileName}`
  );
}

function getArtifactBaseName(fileName: string): string {
  return fileName.replace(/\.json$/i, "");
}

function loadDiagnosticArtifact(fileName: string): any {
  const baseName = getArtifactBaseName(fileName);
  return readJsonFile<any>(
    `10_examples/diagnostics/${baseName}.diagnostic.json`
  );
}

function loadWeeklyReportArtifact(fileName: string): any {
  const baseName = getArtifactBaseName(fileName);
  return readJsonFile<any>(
    `10_examples/weekly_reports/${baseName}.report.json`
  );
}

function resolveDiagnosticSnapshotArtifact(diagnosticArtifact: any): any {
  if (
    diagnosticArtifact &&
    typeof diagnosticArtifact === "object" &&
    !Array.isArray(diagnosticArtifact)
  ) {
    if ("snapshotId" in diagnosticArtifact) {
      return diagnosticArtifact;
    }

    if ("snapshot" in diagnosticArtifact) {
      return diagnosticArtifact.snapshot;
    }
  }

  throw new Error(
    "ASSERTION FAILED: diagnostic artifact must be either a snapshot object or an object containing snapshot"
  );
}

function assertArrayExists(value: unknown, fieldPath: string): void {
  assert(Array.isArray(value), `${fieldPath} must exist and be an array`);
}

function assertObjectExists(value: unknown, fieldPath: string): void {
  assert(
    typeof value === "object" && value !== null && !Array.isArray(value),
    `${fieldPath} must exist and be an object`
  );
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

function validateNormalizedPayload(normalizedPayload: any): void {
  assertObjectExists(normalizedPayload, "normalizedPayload");

  assertRequiredFields(
    normalizedPayload,
    [
      "payloadId",
      "capturedAt",
      "source",
      "sectorType",
      "organizationId",
      "organizationName",
      "siteId",
      "siteName",
      "operationalWeek",
      "throughput",
      "revenue",
      "staffing",
      "time",
      "demand",
      "reporting",
      "normalizationMeta"
    ],
    "normalizedPayload"
  );

  assertObjectExists(normalizedPayload.operationalWeek, "normalizedPayload.operationalWeek");
  assertRequiredFields(
    normalizedPayload.operationalWeek,
    ["weekId", "weekStart", "weekEnd", "timezone", "calendarYear", "weekNumber"],
    "normalizedPayload.operationalWeek"
  );

  assertObjectExists(normalizedPayload.normalizationMeta, "normalizedPayload.normalizationMeta");
  assertRequiredFields(
    normalizedPayload.normalizationMeta,
    ["normalizedAt", "warnings", "sourceValidation"],
    "normalizedPayload.normalizationMeta"
  );

  assertArrayExists(
    normalizedPayload.normalizationMeta.warnings,
    "normalizedPayload.normalizationMeta.warnings"
  );

  assertObjectExists(
    normalizedPayload.normalizationMeta.sourceValidation,
    "normalizedPayload.normalizationMeta.sourceValidation"
  );

  assertRequiredFields(
    normalizedPayload.normalizationMeta.sourceValidation,
    ["valid", "errors", "warnings"],
    "normalizedPayload.normalizationMeta.sourceValidation"
  );

  assertArrayExists(
    normalizedPayload.normalizationMeta.sourceValidation.errors,
    "normalizedPayload.normalizationMeta.sourceValidation.errors"
  );
  assertArrayExists(
    normalizedPayload.normalizationMeta.sourceValidation.warnings,
    "normalizedPayload.normalizationMeta.sourceValidation.warnings"
  );
}

function validateMetrics(metrics: any[], payloadId: string): void {
  assertArrayExists(metrics, "metrics");
  assert(metrics.length > 0, "metrics must not be empty");

  for (let i = 0; i < metrics.length; i += 1) {
    const metric = metrics[i];
    assertObjectExists(metric, `metrics[${i}]`);
    assertRequiredFields(
      metric,
      ["code", "value", "unit", "computedAt", "sourcePayloadId", "confidence"],
      `metrics[${i}]`
    );

    assert(
      metric.sourcePayloadId === payloadId,
      `metrics[${i}].sourcePayloadId must match normalizedPayload.payloadId`
    );
  }
}

function validateSignals(signals: any[], metricCodes: Set<string>): void {
  assertArrayExists(signals, "signals");
  assert(signals.length > 0, "signals must not be empty");

  for (let i = 0; i < signals.length; i += 1) {
    const signal = signals[i];
    assertObjectExists(signal, `signals[${i}]`);
    assertRequiredFields(
      signal,
      ["code", "active", "severity", "message", "evidence", "relatedMetricCodes", "generatedAt"],
      `signals[${i}]`
    );

    assertArrayExists(signal.evidence, `signals[${i}].evidence`);
    assertArrayExists(signal.relatedMetricCodes, `signals[${i}].relatedMetricCodes`);

    for (const relatedMetricCode of signal.relatedMetricCodes) {
      assert(
        metricCodes.has(relatedMetricCode),
        `signals[${i}].relatedMetricCodes contains unknown metric code: ${relatedMetricCode}`
      );
    }
  }
}

function validateDecisionOutput(decisionOutput: any, fieldPath: string): void {
  assertObjectExists(decisionOutput, fieldPath);
  assertRequiredFields(
    decisionOutput,
    ["decisionLabel", "summary", "recommendedActions", "priority"],
    fieldPath
  );
  assertArrayExists(decisionOutput.recommendedActions, `${fieldPath}.recommendedActions`);
}

function validateTwin(twin: any): void {
  assertObjectExists(twin, "twin");
  assertRequiredFields(
    twin,
    [
      "twinId",
      "unitKey",
      "stateLabel",
      "metrics",
      "signals",
      "constraints",
      "diagnosticSummary",
      "decisionOutput",
      "snapshotRef",
      "lastUpdatedAt"
    ],
    "twin"
  );

  assertObjectExists(twin.unitKey, "twin.unitKey");
  assertRequiredFields(
    twin.unitKey,
    ["organizationId", "siteId", "sectorType", "operationalWeek"],
    "twin.unitKey"
  );

  validateDecisionOutput(twin.decisionOutput, "twin.decisionOutput");
  assertArrayExists(twin.metrics, "twin.metrics");
  assertArrayExists(twin.signals, "twin.signals");
  assertArrayExists(twin.constraints, "twin.constraints");
}

function validateSnapshot(snapshot: any, payloadId: string, fieldPath = "snapshot"): void {
  assertObjectExists(snapshot, fieldPath);
  assertRequiredFields(
    snapshot,
    [
      "snapshotId",
      "twinId",
      "unitKey",
      "generatedAt",
      "stateLabel",
      "metrics",
      "signals",
      "constraints",
      "diagnosticType",
      "diagnosticSummary",
      "decisionOutput",
      "sourcePayloadIds",
      "version"
    ],
    fieldPath
  );

  validateDecisionOutput(snapshot.decisionOutput, `${fieldPath}.decisionOutput`);
  assertArrayExists(snapshot.metrics, `${fieldPath}.metrics`);
  assertArrayExists(snapshot.signals, `${fieldPath}.signals`);
  assertArrayExists(snapshot.constraints, `${fieldPath}.constraints`);
  assertArrayExists(snapshot.sourcePayloadIds, `${fieldPath}.sourcePayloadIds`);

  assert(
    snapshot.sourcePayloadIds.includes(payloadId),
    `${fieldPath}.sourcePayloadIds must include normalizedPayload.payloadId`
  );
}

function validateWeeklyReport(weeklyReport: any): void {
  assertObjectExists(weeklyReport, "weeklyReport");
  assertRequiredFields(
    weeklyReport,
    [
      "reportId",
      "reportType",
      "generatedAt",
      "unitKey",
      "snapshotId",
      "twinId",
      "title",
      "subtitle",
      "executiveSummary",
      "priorityActions",
      "sections",
      "linkedSnapshot",
      "deliveryStatus",
      "version"
    ],
    "weeklyReport"
  );

  assertArrayExists(weeklyReport.priorityActions, "weeklyReport.priorityActions");
  assertArrayExists(weeklyReport.sections, "weeklyReport.sections");
  assertObjectExists(weeklyReport.linkedSnapshot, "weeklyReport.linkedSnapshot");

  for (let i = 0; i < weeklyReport.sections.length; i += 1) {
    const section = weeklyReport.sections[i];
    assertObjectExists(section, `weeklyReport.sections[${i}]`);
    assertRequiredFields(
      section,
      ["sectionCode", "title", "content"],
      `weeklyReport.sections[${i}]`
    );
  }
}

function validateReferentialIntegrity(
  normalizedPayload: any,
  twin: any,
  snapshot: any,
  weeklyReport: any
): void {
  assert(
    snapshot.twinId === twin.twinId,
    "snapshot.twinId must match twin.twinId"
  );

  assert(
    twin.snapshotRef === snapshot.snapshotId,
    "twin.snapshotRef must match snapshot.snapshotId"
  );

  assert(
    weeklyReport.snapshotId === snapshot.snapshotId,
    "weeklyReport.snapshotId must match snapshot.snapshotId"
  );

  assert(
    weeklyReport.twinId === twin.twinId,
    "weeklyReport.twinId must match twin.twinId"
  );

  assert(
    JSON.stringify(twin.unitKey) === JSON.stringify(snapshot.unitKey),
    "twin.unitKey must match snapshot.unitKey"
  );

  assert(
    JSON.stringify(snapshot.unitKey) === JSON.stringify(weeklyReport.unitKey),
    "snapshot.unitKey must match weeklyReport.unitKey"
  );

  assert(
    weeklyReport.linkedSnapshot.snapshotId === snapshot.snapshotId,
    "weeklyReport.linkedSnapshot.snapshotId must match snapshot.snapshotId"
  );

  assert(
    weeklyReport.linkedSnapshot.twinId === snapshot.twinId,
    "weeklyReport.linkedSnapshot.twinId must match snapshot.twinId"
  );

  assert(
    JSON.stringify(weeklyReport.linkedSnapshot.unitKey) === JSON.stringify(snapshot.unitKey),
    "weeklyReport.linkedSnapshot.unitKey must match snapshot.unitKey"
  );

  assert(
    weeklyReport.linkedSnapshot.stateLabel === snapshot.stateLabel,
    "weeklyReport.linkedSnapshot.stateLabel must match snapshot.stateLabel"
  );

  assert(
    snapshot.sourcePayloadIds.includes(normalizedPayload.payloadId),
    "snapshot.sourcePayloadIds must include normalizedPayload.payloadId"
  );
}

function validateScenario(fileName: string): void {
  const payload = loadPayload(fileName);
  const runtimeResult = runDiagnostic(payload) as any;

  const diagnosticArtifactRaw = loadDiagnosticArtifact(fileName);
  const diagnosticSnapshotArtifact = resolveDiagnosticSnapshotArtifact(diagnosticArtifactRaw);
  const weeklyReportArtifact = loadWeeklyReportArtifact(fileName);

  const normalizedPayload = runtimeResult.normalizedPayload;
  const metrics = runtimeResult.metrics;
  const signals = runtimeResult.signals;
  const twin = runtimeResult.twin;
  const snapshot = runtimeResult.snapshot;
  const weeklyReport = weeklyReportArtifact;

  validateNormalizedPayload(normalizedPayload);
  validateMetrics(metrics, normalizedPayload.payloadId);

  const metricCodes = new Set<string>(metrics.map((metric: any) => metric.code));
  validateSignals(signals, metricCodes);

  validateTwin(twin);
  validateSnapshot(snapshot, normalizedPayload.payloadId, "snapshot");
  validateSnapshot(
    diagnosticSnapshotArtifact,
    normalizedPayload.payloadId,
    "diagnosticArtifactSnapshot"
  );
  validateWeeklyReport(weeklyReport);
  validateReferentialIntegrity(normalizedPayload, twin, snapshot, weeklyReport);

  assert(
    diagnosticSnapshotArtifact.snapshotId === snapshot.snapshotId,
    "diagnostic artifact snapshotId must match runtime snapshot.snapshotId"
  );

  assert(
    diagnosticSnapshotArtifact.twinId === snapshot.twinId,
    "diagnostic artifact twinId must match runtime snapshot.twinId"
  );

  assert(
    weeklyReport.reportId === `${snapshot.snapshotId}::weekly_report`,
    "weekly report reportId must follow the expected snapshot-derived pattern"
  );
}

function main(): void {
  const manifest = loadScenarioManifest();

  const scenariosToCheck = manifest.scenarios.filter(
    (scenario) => scenario.locked || scenario.status === "validated"
  );

  console.log("--------------------------------------------------");
  console.log("NEXUS PHASE 2 OUTPUT CONTRACT CHECK");
  console.log("--------------------------------------------------");
  console.log(`Scenarios checked: ${scenariosToCheck.length}`);
  console.log("");

  for (const scenario of scenariosToCheck) {
    validateScenario(scenario.fileName);
    console.log(`[PASS] ${scenario.fileName}`);
  }

  console.log("");
  console.log("Output contract check passed.");
  console.log("--------------------------------------------------");
}

main();
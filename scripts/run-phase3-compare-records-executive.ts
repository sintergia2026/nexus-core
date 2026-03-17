import fs from "fs";
import path from "path";
import { PersistedBundleRecord } from "../05_engine/types/PersistedBundleRecord";

function readJsonFile<T>(fullPath: string): T {
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

function requireArg(flag: string): string {
  const value = getArgValue(flag);
  if (!value) {
    throw new Error(`Missing required argument: ${flag}`);
  }
  return value;
}

function getRecordsDirectory(): string {
  return path.resolve(__dirname, "../10_examples/persisted_records");
}

function loadRecordById(persistedBundleId: string): PersistedBundleRecord {
  const fullPath = path.join(getRecordsDirectory(), `${persistedBundleId}.json`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Persisted record not found: ${persistedBundleId}`);
  }

  return readJsonFile<PersistedBundleRecord>(fullPath);
}

function getActiveSignalCodes(record: PersistedBundleRecord): string[] {
  return record.bundle.snapshot.signals
    .filter((signal) => signal.active)
    .map((signal) => signal.code)
    .sort();
}

function getActiveConstraintCodes(record: PersistedBundleRecord): string[] {
  return record.bundle.snapshot.constraints
    .filter((constraint) => constraint.active)
    .map((constraint) => `${constraint.code}:${constraint.severity}`)
    .sort();
}

function getMetricMap(
  record: PersistedBundleRecord
): Record<string, number | string> {
  const map: Record<string, number | string> = {};

  for (const metric of record.bundle.snapshot.metrics) {
    map[metric.code] = metric.value;
  }

  return map;
}

function diffArrays(left: string[], right: string[]): {
  added: string[];
  removed: string[];
} {
  const leftSet = new Set(left);
  const rightSet = new Set(right);

  const added = right.filter((value) => !leftSet.has(value));
  const removed = left.filter((value) => !rightSet.has(value));

  return { added, removed };
}

function printExecutiveChange(
  label: string,
  leftValue: string,
  rightValue: string
): void {
  const changed = leftValue !== rightValue;
  console.log(`${label}:`);
  console.log(`- left:  ${leftValue}`);
  console.log(`- right: ${rightValue}`);
  console.log(`- changed: ${changed ? "yes" : "no"}`);
}

function printSetChange(label: string, left: string[], right: string[]): void {
  const { added, removed } = diffArrays(left, right);

  console.log(`${label}:`);
  console.log(`- left:    ${left.length > 0 ? left.join(", ") : "(none)"}`);
  console.log(`- right:   ${right.length > 0 ? right.join(", ") : "(none)"}`);
  console.log(`- added:   ${added.length > 0 ? added.join(", ") : "(none)"}`);
  console.log(`- removed: ${removed.length > 0 ? removed.join(", ") : "(none)"}`);
}

function printMetricChangeSummary(
  left: PersistedBundleRecord,
  right: PersistedBundleRecord
): void {
  const leftMetrics = getMetricMap(left);
  const rightMetrics = getMetricMap(right);

  const allCodes = Array.from(
    new Set([...Object.keys(leftMetrics), ...Object.keys(rightMetrics)])
  ).sort();

  const changed: string[] = [];

  for (const code of allCodes) {
    const leftValue = leftMetrics[code];
    const rightValue = rightMetrics[code];

    if (leftValue === rightValue) {
      continue;
    }

    changed.push(`${code}: ${String(leftValue)} -> ${String(rightValue)}`);
  }

  console.log("Metric Change Summary:");
  if (changed.length === 0) {
    console.log("- No metric differences detected.");
    return;
  }

  for (const line of changed) {
    console.log(`- ${line}`);
  }
}

function printRecommendedReading(
  left: PersistedBundleRecord,
  right: PersistedBundleRecord
): void {
  const leftState = left.bundle.snapshot.stateLabel;
  const rightState = right.bundle.snapshot.stateLabel;
  const leftDecision = left.bundle.snapshot.decisionOutput.decisionLabel;
  const rightDecision = right.bundle.snapshot.decisionOutput.decisionLabel;
  const leftPriority = left.bundle.snapshot.decisionOutput.priority;
  const rightPriority = right.bundle.snapshot.decisionOutput.priority;

  console.log("Executive Reading:");

  if (
    leftState === rightState &&
    leftDecision === rightDecision &&
    leftPriority === rightPriority
  ) {
    console.log(
      "- No governing posture change detected between the two records."
    );
    return;
  }

  console.log(
    `- Governing posture changed from ${leftState} / ${leftDecision} / ${leftPriority} to ${rightState} / ${rightDecision} / ${rightPriority}.`
  );
}

function main(): void {
  const leftId = requireArg("--left");
  const rightId = requireArg("--right");

  const left = loadRecordById(leftId);
  const right = loadRecordById(rightId);

  console.log("==================================================");
  console.log("NEXUS PHASE 3 COMPARE RECORDS EXECUTIVE");
  console.log("==================================================");
  console.log(`Left Record:  ${left.persistedBundleId}`);
  console.log(`Right Record: ${right.persistedBundleId}`);
  console.log("");

  console.log("Context:");
  console.log(
    `- left:  ${left.retrieval.organizationId} / ${left.retrieval.siteId} / ${left.retrieval.weekId}`
  );
  console.log(
    `- right: ${right.retrieval.organizationId} / ${right.retrieval.siteId} / ${right.retrieval.weekId}`
  );
  console.log("");

  printExecutiveChange(
    "Record Status",
    left.recordStatus,
    right.recordStatus
  );
  console.log("");

  printExecutiveChange(
    "State Label",
    left.bundle.snapshot.stateLabel,
    right.bundle.snapshot.stateLabel
  );
  console.log("");

  printExecutiveChange(
    "Decision Label",
    left.bundle.snapshot.decisionOutput.decisionLabel,
    right.bundle.snapshot.decisionOutput.decisionLabel
  );
  console.log("");

  printExecutiveChange(
    "Priority",
    left.bundle.snapshot.decisionOutput.priority,
    right.bundle.snapshot.decisionOutput.priority
  );
  console.log("");

  printSetChange(
    "Active Signals",
    getActiveSignalCodes(left),
    getActiveSignalCodes(right)
  );
  console.log("");

  printSetChange(
    "Active Constraints",
    getActiveConstraintCodes(left),
    getActiveConstraintCodes(right)
  );
  console.log("");

  printMetricChangeSummary(left, right);
  console.log("");

  printRecommendedReading(left, right);
  console.log("==================================================");
}

main();
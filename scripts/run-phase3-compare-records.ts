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

function arraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function printMetricDiffs(
  left: PersistedBundleRecord,
  right: PersistedBundleRecord
): void {
  const leftMetrics = getMetricMap(left);
  const rightMetrics = getMetricMap(right);

  const allCodes = Array.from(
    new Set([...Object.keys(leftMetrics), ...Object.keys(rightMetrics)])
  ).sort();

  const differences: string[] = [];

  for (const code of allCodes) {
    const leftValue = leftMetrics[code];
    const rightValue = rightMetrics[code];

    if (leftValue === rightValue) {
      continue;
    }

    differences.push(`- ${code}: ${String(leftValue)} -> ${String(rightValue)}`);
  }

  console.log("Metric Differences:");

  if (differences.length === 0) {
    console.log("- No metric differences detected.");
    return;
  }

  for (const line of differences) {
    console.log(line);
  }
}

function printArrayChange(
  label: string,
  leftValues: string[],
  rightValues: string[]
): void {
  const leftJoined = leftValues.length > 0 ? leftValues.join(", ") : "(none)";
  const rightJoined = rightValues.length > 0 ? rightValues.join(", ") : "(none)";

  console.log(`${label}:`);
  console.log(`- left:  ${leftJoined}`);
  console.log(`- right: ${rightJoined}`);

  if (arraysEqual(leftValues, rightValues)) {
    console.log(`- No ${label.toLowerCase()} differences detected.`);
  }
}

function main(): void {
  const leftId = requireArg("--left");
  const rightId = requireArg("--right");

  const left = loadRecordById(leftId);
  const right = loadRecordById(rightId);

  console.log("==================================================");
  console.log("NEXUS PHASE 3 COMPARE RECORDS");
  console.log("==================================================");
  console.log(`Left Record:  ${left.persistedBundleId}`);
  console.log(`Right Record: ${right.persistedBundleId}`);
  console.log("");

  console.log("Context:");
  console.log(`- Left  Site/Week: ${left.retrieval.siteId} / ${left.retrieval.weekId}`);
  console.log(`- Right Site/Week: ${right.retrieval.siteId} / ${right.retrieval.weekId}`);
  console.log("");

  console.log("Status:");
  console.log(`- Left  Status: ${left.recordStatus}`);
  console.log(`- Right Status: ${right.recordStatus}`);
  console.log("");

  console.log("State / Decision / Priority:");
  console.log(`- Left  State: ${left.bundle.snapshot.stateLabel}`);
  console.log(`- Right State: ${right.bundle.snapshot.stateLabel}`);
  console.log(
    `- Left  Decision: ${left.bundle.snapshot.decisionOutput.decisionLabel}`
  );
  console.log(
    `- Right Decision: ${right.bundle.snapshot.decisionOutput.decisionLabel}`
  );
  console.log(
    `- Left  Priority: ${left.bundle.snapshot.decisionOutput.priority}`
  );
  console.log(
    `- Right Priority: ${right.bundle.snapshot.decisionOutput.priority}`
  );
  console.log("");

  printArrayChange(
    "Active Signals",
    getActiveSignalCodes(left),
    getActiveSignalCodes(right)
  );
  console.log("");

  printArrayChange(
    "Active Constraints",
    getActiveConstraintCodes(left),
    getActiveConstraintCodes(right)
  );
  console.log("");

  printMetricDiffs(left, right);

  console.log("==================================================");
}

main();
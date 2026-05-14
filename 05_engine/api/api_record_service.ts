import fs from "fs";
import path from "path";
import {
  queryPersistedRecordIndex,
  PersistedRecordIndexQuery,
} from "../persistence/query_persisted_record_index";
import { PersistedBundleRecord } from "../types/PersistedBundleRecord";
import { ApiRecordSummary } from "../types/ApiRecordSummary";
import {
  ComparisonEnvelope,
  ComparisonMetricDifference,
  MultiRecordEnvelope,
  MultiRecordSummaryEnvelope,
  SingleRecordEnvelope,
  SingleRecordSummaryEnvelope,
} from "../types/ApiEnvelope";

function getRecordsDirectory(): string {
  return process.env.NEXUS_RECORDS_DIR ?? path.resolve(__dirname, "../../10_examples/persisted_records");
}

function readRecordById(
  persistedBundleId: string
): PersistedBundleRecord | null {
  const fullPath = path.join(getRecordsDirectory(), `${persistedBundleId}.json`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as PersistedBundleRecord;
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

function diffArrays(
  left: string[],
  right: string[]
): {
  added: string[];
  removed: string[];
} {
  const leftSet = new Set(left);
  const rightSet = new Set(right);

  return {
    added: right.filter((value) => !leftSet.has(value)),
    removed: left.filter((value) => !rightSet.has(value)),
  };
}

function buildExecutiveReading(
  left: PersistedBundleRecord,
  right: PersistedBundleRecord
): string {
  const leftState = left.bundle.snapshot.stateLabel;
  const rightState = right.bundle.snapshot.stateLabel;
  const leftDecision = left.bundle.snapshot.decisionOutput.decisionLabel;
  const rightDecision = right.bundle.snapshot.decisionOutput.decisionLabel;
  const leftPriority = left.bundle.snapshot.decisionOutput.priority;
  const rightPriority = right.bundle.snapshot.decisionOutput.priority;

  if (
    leftState === rightState &&
    leftDecision === rightDecision &&
    leftPriority === rightPriority
  ) {
    return "No governing posture change detected between the two records.";
  }

  return `Governing posture changed from ${leftState} / ${leftDecision} / ${leftPriority} to ${rightState} / ${rightDecision} / ${rightPriority}.`;
}

function buildMetricDifferences(
  left: PersistedBundleRecord,
  right: PersistedBundleRecord
): ComparisonMetricDifference[] {
  const leftMetrics = getMetricMap(left);
  const rightMetrics = getMetricMap(right);

  const allCodes = Array.from(
    new Set([...Object.keys(leftMetrics), ...Object.keys(rightMetrics)])
  ).sort();

  const differences: ComparisonMetricDifference[] = [];

  for (const code of allCodes) {
    const leftValue = leftMetrics[code] ?? null;
    const rightValue = rightMetrics[code] ?? null;

    if (leftValue === rightValue) {
      continue;
    }

    differences.push({
      code,
      leftValue,
      rightValue,
    });
  }

  return differences;
}

function toSummary(record: PersistedBundleRecord): ApiRecordSummary {
  return {
    persistedBundleId: record.persistedBundleId,
    recordStatus: record.recordStatus,
    organizationId: record.retrieval.organizationId,
    siteId: record.retrieval.siteId,
    sectorType: record.retrieval.sectorType,
    weekId: record.retrieval.weekId,
    calendarYear: record.retrieval.calendarYear,
    weekNumber: record.retrieval.weekNumber,
    bundleVersion: record.identity.bundleVersion,
    persistenceVersion: record.persistenceVersion,
    snapshotId: record.identity.snapshotId,
    twinId: record.identity.twinId,
    reportId: record.identity.reportId,
    stateLabel: record.bundle.snapshot.stateLabel,
    decisionLabel: record.bundle.snapshot.decisionOutput.decisionLabel,
    priority: record.bundle.snapshot.decisionOutput.priority,
    activeSignals: getActiveSignalCodes(record),
    activeConstraints: getActiveConstraintCodes(record),
    storedAt: record.storedAt,
  };
}

export function getRecordByIdEnvelope(
  persistedBundleId: string
): SingleRecordEnvelope {
  const record = readRecordById(persistedBundleId);

  if (!record) {
    return {
      responseType: "single_record",
      responseVersion: "1.0.0",
      requestedContext: { persistedBundleId },
      found: false,
      record: null,
      servedAt: new Date().toISOString(),
      error: {
        code: "RECORD_NOT_FOUND",
        message: "Persisted record was not found.",
        details: { persistedBundleId },
      },
    };
  }

  return {
    responseType: "single_record",
    responseVersion: "1.0.0",
    requestedContext: { persistedBundleId },
    found: true,
    record,
    servedAt: new Date().toISOString(),
    error: null,
  };
}

export function getRecordSummaryByIdEnvelope(
  persistedBundleId: string
): SingleRecordSummaryEnvelope {
  const record = readRecordById(persistedBundleId);

  if (!record) {
    return {
      responseType: "single_record_summary",
      responseVersion: "1.0.0",
      requestedContext: { persistedBundleId },
      found: false,
      record: null,
      servedAt: new Date().toISOString(),
      error: {
        code: "RECORD_NOT_FOUND",
        message: "Persisted record was not found.",
        details: { persistedBundleId },
      },
    };
  }

  return {
    responseType: "single_record_summary",
    responseVersion: "1.0.0",
    requestedContext: { persistedBundleId },
    found: true,
    record: toSummary(record),
    servedAt: new Date().toISOString(),
    error: null,
  };
}

export function getActiveRecordByContextEnvelope(params: {
  organizationId: string;
  siteId: string;
  weekId: string;
}): SingleRecordEnvelope {
  const { organizationId, siteId, weekId } = params;

  const entries = queryPersistedRecordIndex({
    organizationId,
    siteId,
    weekId,
    recordStatus: "active",
  });

  if (entries.length === 0) {
    return {
      responseType: "single_record",
      responseVersion: "1.0.0",
      requestedContext: params,
      found: false,
      record: null,
      servedAt: new Date().toISOString(),
      error: {
        code: "ACTIVE_RECORD_NOT_FOUND",
        message:
          "No active persisted record was found for the requested context.",
        details: params,
      },
    };
  }

  if (entries.length > 1) {
    return {
      responseType: "single_record",
      responseVersion: "1.0.0",
      requestedContext: params,
      found: false,
      record: null,
      servedAt: new Date().toISOString(),
      error: {
        code: "MULTIPLE_ACTIVE_RECORDS",
        message:
          "Multiple active persisted records were found for the requested context.",
        details: {
          ...params,
          persistedBundleIds: entries.map((entry) => entry.persistedBundleId),
        },
      },
    };
  }

  const record = readRecordById(entries[0].persistedBundleId);

  return {
    responseType: "single_record",
    responseVersion: "1.0.0",
    requestedContext: params,
    found: record !== null,
    record,
    servedAt: new Date().toISOString(),
    error:
      record === null
        ? {
            code: "ACTIVE_RECORD_FILE_MISSING",
            message:
              "Active record index entry exists but the record file is missing.",
            details: params,
          }
        : null,
  };
}

export function getActiveRecordSummaryByContextEnvelope(params: {
  organizationId: string;
  siteId: string;
  weekId: string;
}): SingleRecordSummaryEnvelope {
  const fullEnvelope = getActiveRecordByContextEnvelope(params);

  return {
    responseType: "single_record_summary",
    responseVersion: fullEnvelope.responseVersion,
    requestedContext: fullEnvelope.requestedContext,
    found: fullEnvelope.found,
    record: fullEnvelope.record ? toSummary(fullEnvelope.record) : null,
    servedAt: new Date().toISOString(),
    error: fullEnvelope.error,
  };
}

export function queryRecordsEnvelope(
  query: PersistedRecordIndexQuery
): MultiRecordEnvelope {
  const entries = queryPersistedRecordIndex(query);
  const records = entries
    .map((entry) => readRecordById(entry.persistedBundleId))
    .filter((record): record is PersistedBundleRecord => record !== null);

  return {
    responseType: "multi_record",
    responseVersion: "1.0.0",
    query: { ...query },
    resultCount: records.length,
    records,
    servedAt: new Date().toISOString(),
    error: null,
  };
}

export function queryRecordSummariesEnvelope(
  query: PersistedRecordIndexQuery
): MultiRecordSummaryEnvelope {
  const fullEnvelope = queryRecordsEnvelope(query);

  return {
    responseType: "multi_record_summary",
    responseVersion: fullEnvelope.responseVersion,
    query: fullEnvelope.query,
    resultCount: fullEnvelope.resultCount,
    records: fullEnvelope.records.map(toSummary),
    servedAt: new Date().toISOString(),
    error: fullEnvelope.error,
  };
}

export function compareRecordsEnvelope(params: {
  leftRecordId: string;
  rightRecordId: string;
}): ComparisonEnvelope {
  const left = readRecordById(params.leftRecordId);
  const right = readRecordById(params.rightRecordId);

  if (!left || !right) {
    return {
      responseType: "record_comparison",
      responseVersion: "1.0.0",
      leftRecordId: params.leftRecordId,
      rightRecordId: params.rightRecordId,
      contextSummary: {
        left: {
          organizationId: left?.retrieval.organizationId ?? "unknown",
          siteId: left?.retrieval.siteId ?? "unknown",
          weekId: left?.retrieval.weekId ?? "unknown",
          recordStatus: left?.recordStatus ?? "unknown",
        },
        right: {
          organizationId: right?.retrieval.organizationId ?? "unknown",
          siteId: right?.retrieval.siteId ?? "unknown",
          weekId: right?.retrieval.weekId ?? "unknown",
          recordStatus: right?.recordStatus ?? "unknown",
        },
      },
      postureComparison: {
        stateLabelChanged: false,
        decisionLabelChanged: false,
        priorityChanged: false,
        leftStateLabel: left?.bundle.snapshot.stateLabel ?? "unknown",
        rightStateLabel: right?.bundle.snapshot.stateLabel ?? "unknown",
        leftDecisionLabel:
          left?.bundle.snapshot.decisionOutput.decisionLabel ?? "unknown",
        rightDecisionLabel:
          right?.bundle.snapshot.decisionOutput.decisionLabel ?? "unknown",
        leftPriority: left?.bundle.snapshot.decisionOutput.priority ?? "unknown",
        rightPriority:
          right?.bundle.snapshot.decisionOutput.priority ?? "unknown",
      },
      signalComparison: {
        leftActiveSignals: left ? getActiveSignalCodes(left) : [],
        rightActiveSignals: right ? getActiveSignalCodes(right) : [],
        addedSignals: [],
        removedSignals: [],
      },
      constraintComparison: {
        leftActiveConstraints: left ? getActiveConstraintCodes(left) : [],
        rightActiveConstraints: right ? getActiveConstraintCodes(right) : [],
        addedConstraints: [],
        removedConstraints: [],
      },
      metricDifferences: [],
      executiveReading:
        "Comparison could not be completed because one or both records were not found.",
      servedAt: new Date().toISOString(),
      error: {
        code: "COMPARISON_RECORD_NOT_FOUND",
        message: "One or both persisted records were not found.",
        details: params,
      },
    };
  }

  const leftSignals = getActiveSignalCodes(left);
  const rightSignals = getActiveSignalCodes(right);
  const signalDiff = diffArrays(leftSignals, rightSignals);

  const leftConstraints = getActiveConstraintCodes(left);
  const rightConstraints = getActiveConstraintCodes(right);
  const constraintDiff = diffArrays(leftConstraints, rightConstraints);

  return {
    responseType: "record_comparison",
    responseVersion: "1.0.0",
    leftRecordId: params.leftRecordId,
    rightRecordId: params.rightRecordId,
    contextSummary: {
      left: {
        organizationId: left.retrieval.organizationId,
        siteId: left.retrieval.siteId,
        weekId: left.retrieval.weekId,
        recordStatus: left.recordStatus,
      },
      right: {
        organizationId: right.retrieval.organizationId,
        siteId: right.retrieval.siteId,
        weekId: right.retrieval.weekId,
        recordStatus: right.recordStatus,
      },
    },
    postureComparison: {
      stateLabelChanged:
        left.bundle.snapshot.stateLabel !== right.bundle.snapshot.stateLabel,
      decisionLabelChanged:
        left.bundle.snapshot.decisionOutput.decisionLabel !==
        right.bundle.snapshot.decisionOutput.decisionLabel,
      priorityChanged:
        left.bundle.snapshot.decisionOutput.priority !==
        right.bundle.snapshot.decisionOutput.priority,
      leftStateLabel: left.bundle.snapshot.stateLabel,
      rightStateLabel: right.bundle.snapshot.stateLabel,
      leftDecisionLabel: left.bundle.snapshot.decisionOutput.decisionLabel,
      rightDecisionLabel: right.bundle.snapshot.decisionOutput.decisionLabel,
      leftPriority: left.bundle.snapshot.decisionOutput.priority,
      rightPriority: right.bundle.snapshot.decisionOutput.priority,
    },
    signalComparison: {
      leftActiveSignals: leftSignals,
      rightActiveSignals: rightSignals,
      addedSignals: signalDiff.added,
      removedSignals: signalDiff.removed,
    },
    constraintComparison: {
      leftActiveConstraints: leftConstraints,
      rightActiveConstraints: rightConstraints,
      addedConstraints: constraintDiff.added,
      removedConstraints: constraintDiff.removed,
    },
    metricDifferences: buildMetricDifferences(left, right),
    executiveReading: buildExecutiveReading(left, right),
    servedAt: new Date().toISOString(),
    error: null,
  };
}
import fs from "fs/promises";
import path from "path";

import type {
  ApiErrorBlock,
  SingleRecordSummaryEnvelope,
  MultiRecordSummaryEnvelope,
  ComparisonMetricDifference,
  ComparisonEnvelope,
} from "../../../../05_engine/types/ApiEnvelope";
import type { ApiRecordSummary } from "../../../../05_engine/types/ApiRecordSummary";
import type {
  PersistedRecordIndexEntry,
  PersistedRecordIndex,
} from "../../../../05_engine/types/PersistedRecordIndex";

export type {
  ApiErrorBlock,
  SingleRecordSummaryEnvelope,
  MultiRecordSummaryEnvelope,
  ComparisonMetricDifference,
  ComparisonEnvelope,
};
export type { ApiRecordSummary };

export interface DiagnosticMetric {
  code: string;
  value: number | string;
}

export interface DiagnosticSignal {
  code: string;
  active: boolean;
  severity?: string;
  message?: string;
}

export interface DiagnosticConstraint {
  code: string;
  active: boolean;
  severity: string;
  description?: string;
}

export interface ActiveDiagnosticEnvelope {
  responseType: "active_diagnostic";
  responseVersion: string;
  requestedContext: Record<string, unknown>;
  found: boolean;
  diagnostic: {
    persistedBundleId: string;
    recordStatus: string;
    organizationId: string;
    siteId: string;
    weekId: string;
    stateLabel: string;
    decisionLabel: string;
    priority: string;
    metrics: DiagnosticMetric[];
    activeSignals: DiagnosticSignal[];
    activeConstraints: DiagnosticConstraint[];
    storedAt: string;
  } | null;
  servedAt: string;
  error: ApiErrorBlock | null;
}

interface PersistedBundleRecord {
  persistedBundleId: string;
  persistenceVersion: string;
  recordStatus: "active" | "superseded" | "archived";
  storedAt: string;
  identity: {
    bundleVersion: string;
    snapshotId: string;
    twinId: string;
    reportId: string;
  };
  retrieval: {
    organizationId: string;
    siteId: string;
    sectorType: string;
    weekId: string;
    calendarYear: number;
    weekNumber: number;
  };
  bundle: {
    snapshot: {
      stateLabel: string;
      metrics: Array<{
        code: string;
        value: number | string;
      }>;
      signals: Array<{
        code: string;
        active: boolean;
        severity?: string;
        message?: string;
      }>;
      constraints: Array<{
        code: string;
        active: boolean;
        severity: string;
        description?: string;
      }>;
      decisionOutput: {
        decisionLabel: string;
        priority: string;
      };
    };
  };
}

export const INTERNAL_RECORDS_CONTEXT = {
  organizationId: "org-sintergia-demo",
  siteId: "site-004",
  weekId: "site-004::2026-W11",
};

export const INTERNAL_RECORDS_COMPARE = {
  leftRecordId:
    "pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0001",
  rightRecordId:
    "pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0002",
};

function getPersistedRecordsDir(): string {
  return path.resolve(process.cwd(), "../../10_examples/persisted_records");
}

async function readJsonFile<T>(fullPath: string): Promise<T> {
  const raw = await fs.readFile(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

async function loadIndex(): Promise<PersistedRecordIndex> {
  const fullPath = path.join(
    getPersistedRecordsDir(),
    "index.persisted_records.json"
  );
  return readJsonFile<PersistedRecordIndex>(fullPath);
}

async function readRecordById(
  persistedBundleId: string
): Promise<PersistedBundleRecord | null> {
  const fullPath = path.join(
    getPersistedRecordsDir(),
    `${persistedBundleId}.json`
  );

  try {
    return await readJsonFile<PersistedBundleRecord>(fullPath);
  } catch {
    return null;
  }
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
    activeSignals: record.bundle.snapshot.signals
      .filter((signal) => signal.active)
      .map((signal) => signal.code)
      .sort(),
    activeConstraints: record.bundle.snapshot.constraints
      .filter((constraint) => constraint.active)
      .map((constraint) => `${constraint.code}:${constraint.severity}`)
      .sort(),
    storedAt: record.storedAt,
  };
}

function toActiveDiagnostic(record: PersistedBundleRecord) {
  return {
    persistedBundleId: record.persistedBundleId,
    recordStatus: record.recordStatus,
    organizationId: record.retrieval.organizationId,
    siteId: record.retrieval.siteId,
    weekId: record.retrieval.weekId,
    stateLabel: record.bundle.snapshot.stateLabel,
    decisionLabel: record.bundle.snapshot.decisionOutput.decisionLabel,
    priority: record.bundle.snapshot.decisionOutput.priority,
    metrics: [...record.bundle.snapshot.metrics].sort((a, b) =>
      a.code.localeCompare(b.code)
    ),
    activeSignals: record.bundle.snapshot.signals
      .filter((signal) => signal.active)
      .sort((a, b) => a.code.localeCompare(b.code)),
    activeConstraints: record.bundle.snapshot.constraints
      .filter((constraint) => constraint.active)
      .sort((a, b) => a.code.localeCompare(b.code)),
    storedAt: record.storedAt,
  };
}

function diffArrays(left: string[], right: string[]): {
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

function buildMetricMap(
  record: PersistedBundleRecord
): Record<string, number | string> {
  const map: Record<string, number | string> = {};

  for (const metric of record.bundle.snapshot.metrics) {
    map[metric.code] = metric.value;
  }

  return map;
}

function buildMetricDifferences(
  left: PersistedBundleRecord,
  right: PersistedBundleRecord
): ComparisonMetricDifference[] {
  const leftMetrics = buildMetricMap(left);
  const rightMetrics = buildMetricMap(right);

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

export async function getActiveRecordSummaryByContext(params: {
  organizationId: string;
  siteId: string;
  weekId: string;
}): Promise<SingleRecordSummaryEnvelope> {
  const servedAt = new Date().toISOString();

  try {
    const index = await loadIndex();

    const matches = index.entries.filter(
      (entry) =>
        entry.organizationId === params.organizationId &&
        entry.siteId === params.siteId &&
        entry.weekId === params.weekId &&
        entry.recordStatus === "active"
    );

    if (matches.length === 0) {
      return {
        responseType: "single_record_summary",
        responseVersion: "1.0.0",
        requestedContext: params,
        found: false,
        record: null,
        servedAt,
        error: {
          code: "ACTIVE_RECORD_NOT_FOUND",
          message: "No active persisted record was found for the requested context.",
          details: params,
        },
      };
    }

    if (matches.length > 1) {
      return {
        responseType: "single_record_summary",
        responseVersion: "1.0.0",
        requestedContext: params,
        found: false,
        record: null,
        servedAt,
        error: {
          code: "MULTIPLE_ACTIVE_RECORDS",
          message: "Multiple active persisted records were found for the requested context.",
          details: {
            ...params,
            persistedBundleIds: matches.map((entry) => entry.persistedBundleId),
          },
        },
      };
    }

    const record = await readRecordById(matches[0].persistedBundleId);

    if (!record) {
      return {
        responseType: "single_record_summary",
        responseVersion: "1.0.0",
        requestedContext: params,
        found: false,
        record: null,
        servedAt,
        error: {
          code: "ACTIVE_RECORD_FILE_MISSING",
          message: "Active record index entry exists but the record file is missing.",
          details: params,
        },
      };
    }

    return {
      responseType: "single_record_summary",
      responseVersion: "1.0.0",
      requestedContext: params,
      found: true,
      record: toSummary(record),
      servedAt,
      error: null,
    };
  } catch (error) {
    return {
      responseType: "single_record_summary",
      responseVersion: "1.0.0",
      requestedContext: params,
      found: false,
      record: null,
      servedAt,
      error: {
        code: "SUMMARY_LOAD_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

export async function getActiveDiagnosticByContext(params: {
  organizationId: string;
  siteId: string;
  weekId: string;
}): Promise<ActiveDiagnosticEnvelope> {
  const servedAt = new Date().toISOString();

  try {
    const index = await loadIndex();

    const matches = index.entries.filter(
      (entry) =>
        entry.organizationId === params.organizationId &&
        entry.siteId === params.siteId &&
        entry.weekId === params.weekId &&
        entry.recordStatus === "active"
    );

    if (matches.length === 0) {
      return {
        responseType: "active_diagnostic",
        responseVersion: "1.0.0",
        requestedContext: params,
        found: false,
        diagnostic: null,
        servedAt,
        error: {
          code: "ACTIVE_DIAGNOSTIC_NOT_FOUND",
          message: "No active diagnostic was found for the requested context.",
          details: params,
        },
      };
    }

    const record = await readRecordById(matches[0].persistedBundleId);

    if (!record) {
      return {
        responseType: "active_diagnostic",
        responseVersion: "1.0.0",
        requestedContext: params,
        found: false,
        diagnostic: null,
        servedAt,
        error: {
          code: "ACTIVE_DIAGNOSTIC_FILE_MISSING",
          message: "Active diagnostic record file is missing.",
          details: params,
        },
      };
    }

    return {
      responseType: "active_diagnostic",
      responseVersion: "1.0.0",
      requestedContext: params,
      found: true,
      diagnostic: toActiveDiagnostic(record),
      servedAt,
      error: null,
    };
  } catch (error) {
    return {
      responseType: "active_diagnostic",
      responseVersion: "1.0.0",
      requestedContext: params,
      found: false,
      diagnostic: null,
      servedAt,
      error: {
        code: "ACTIVE_DIAGNOSTIC_LOAD_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

export async function queryRecordSummaries(params: {
  organizationId?: string;
  siteId?: string;
  weekId?: string;
  recordStatus?: "active" | "superseded" | "archived";
}): Promise<MultiRecordSummaryEnvelope> {
  const servedAt = new Date().toISOString();

  try {
    const index = await loadIndex();

    const matches = index.entries.filter((entry) => {
      if (
        params.organizationId !== undefined &&
        entry.organizationId !== params.organizationId
      ) {
        return false;
      }

      if (params.siteId !== undefined && entry.siteId !== params.siteId) {
        return false;
      }

      if (params.weekId !== undefined && entry.weekId !== params.weekId) {
        return false;
      }

      if (
        params.recordStatus !== undefined &&
        entry.recordStatus !== params.recordStatus
      ) {
        return false;
      }

      return true;
    });

    const records = (
      await Promise.all(
        matches.map((entry) => readRecordById(entry.persistedBundleId))
      )
    )
      .filter((record): record is PersistedBundleRecord => record !== null)
      .map(toSummary);

    return {
      responseType: "multi_record_summary",
      responseVersion: "1.0.0",
      query: params,
      resultCount: records.length,
      records,
      servedAt,
      error: null,
    };
  } catch (error) {
    return {
      responseType: "multi_record_summary",
      responseVersion: "1.0.0",
      query: params,
      resultCount: 0,
      records: [],
      servedAt,
      error: {
        code: "HISTORY_LOAD_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

export async function compareRecordsById(params: {
  leftRecordId: string;
  rightRecordId: string;
}): Promise<ComparisonEnvelope> {
  const servedAt = new Date().toISOString();

  const left = await readRecordById(params.leftRecordId);
  const right = await readRecordById(params.rightRecordId);

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
        leftActiveSignals: [],
        rightActiveSignals: [],
        addedSignals: [],
        removedSignals: [],
      },
      constraintComparison: {
        leftActiveConstraints: [],
        rightActiveConstraints: [],
        addedConstraints: [],
        removedConstraints: [],
      },
      metricDifferences: [],
      executiveReading:
        "Comparison could not be completed because one or both records were not found.",
      servedAt,
      error: {
        code: "COMPARISON_RECORD_NOT_FOUND",
        message: "One or both persisted records were not found.",
      },
    };
  }

  const leftSignals = left.bundle.snapshot.signals
    .filter((signal) => signal.active)
    .map((signal) => signal.code)
    .sort();

  const rightSignals = right.bundle.snapshot.signals
    .filter((signal) => signal.active)
    .map((signal) => signal.code)
    .sort();

  const leftConstraints = left.bundle.snapshot.constraints
    .filter((constraint) => constraint.active)
    .map((constraint) => `${constraint.code}:${constraint.severity}`)
    .sort();

  const rightConstraints = right.bundle.snapshot.constraints
    .filter((constraint) => constraint.active)
    .map((constraint) => `${constraint.code}:${constraint.severity}`)
    .sort();

  const signalDiff = diffArrays(leftSignals, rightSignals);
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
    servedAt,
    error: null,
  };
}
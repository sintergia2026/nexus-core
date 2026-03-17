import { PersistedBundleRecord } from "./PersistedBundleRecord";
import { ApiRecordSummary } from "./ApiRecordSummary";

export interface ApiErrorBlock {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface SingleRecordEnvelope {
  responseType: "single_record";
  responseVersion: string;
  requestedContext: Record<string, unknown>;
  found: boolean;
  record: PersistedBundleRecord | null;
  servedAt: string;
  error: ApiErrorBlock | null;
}

export interface MultiRecordEnvelope {
  responseType: "multi_record";
  responseVersion: string;
  query: Record<string, unknown>;
  resultCount: number;
  records: PersistedBundleRecord[];
  servedAt: string;
  error: ApiErrorBlock | null;
}

export interface SingleRecordSummaryEnvelope {
  responseType: "single_record_summary";
  responseVersion: string;
  requestedContext: Record<string, unknown>;
  found: boolean;
  record: ApiRecordSummary | null;
  servedAt: string;
  error: ApiErrorBlock | null;
}

export interface MultiRecordSummaryEnvelope {
  responseType: "multi_record_summary";
  responseVersion: string;
  query: Record<string, unknown>;
  resultCount: number;
  records: ApiRecordSummary[];
  servedAt: string;
  error: ApiErrorBlock | null;
}

export interface ComparisonMetricDifference {
  code: string;
  leftValue: number | string | null;
  rightValue: number | string | null;
}

export interface ComparisonEnvelope {
  responseType: "record_comparison";
  responseVersion: string;
  leftRecordId: string;
  rightRecordId: string;
  contextSummary: {
    left: {
      organizationId: string;
      siteId: string;
      weekId: string;
      recordStatus: string;
    };
    right: {
      organizationId: string;
      siteId: string;
      weekId: string;
      recordStatus: string;
    };
  };
  postureComparison: {
    stateLabelChanged: boolean;
    decisionLabelChanged: boolean;
    priorityChanged: boolean;
    leftStateLabel: string;
    rightStateLabel: string;
    leftDecisionLabel: string;
    rightDecisionLabel: string;
    leftPriority: string;
    rightPriority: string;
  };
  signalComparison: {
    leftActiveSignals: string[];
    rightActiveSignals: string[];
    addedSignals: string[];
    removedSignals: string[];
  };
  constraintComparison: {
    leftActiveConstraints: string[];
    rightActiveConstraints: string[];
    addedConstraints: string[];
    removedConstraints: string[];
  };
  metricDifferences: ComparisonMetricDifference[];
  executiveReading: string;
  servedAt: string;
  error: ApiErrorBlock | null;
}
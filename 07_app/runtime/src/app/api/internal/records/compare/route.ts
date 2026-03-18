import { NextResponse } from "next/server";
import { compareRecordsById } from "@/lib/internal-records-client";

interface CompareBody {
  leftRecordId?: string;
  rightRecordId?: string;
}

export async function POST(request: Request) {
  let body: CompareBody;

  try {
    body = (await request.json()) as CompareBody;
  } catch {
    return NextResponse.json(
      {
        responseType: "record_comparison",
        responseVersion: "1.0.0",
        leftRecordId: "unknown",
        rightRecordId: "unknown",
        contextSummary: {
          left: {
            organizationId: "unknown",
            siteId: "unknown",
            weekId: "unknown",
            recordStatus: "unknown",
          },
          right: {
            organizationId: "unknown",
            siteId: "unknown",
            weekId: "unknown",
            recordStatus: "unknown",
          },
        },
        postureComparison: {
          stateLabelChanged: false,
          decisionLabelChanged: false,
          priorityChanged: false,
          leftStateLabel: "unknown",
          rightStateLabel: "unknown",
          leftDecisionLabel: "unknown",
          rightDecisionLabel: "unknown",
          leftPriority: "unknown",
          rightPriority: "unknown",
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
          "Comparison could not be completed because the request was invalid.",
        servedAt: new Date().toISOString(),
        error: {
          code: "BAD_REQUEST",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 }
    );
  }

  const leftRecordId = body.leftRecordId ?? "";
  const rightRecordId = body.rightRecordId ?? "";

  if (!leftRecordId || !rightRecordId) {
    return NextResponse.json(
      {
        responseType: "record_comparison",
        responseVersion: "1.0.0",
        leftRecordId,
        rightRecordId,
        contextSummary: {
          left: {
            organizationId: "unknown",
            siteId: "unknown",
            weekId: "unknown",
            recordStatus: "unknown",
          },
          right: {
            organizationId: "unknown",
            siteId: "unknown",
            weekId: "unknown",
            recordStatus: "unknown",
          },
        },
        postureComparison: {
          stateLabelChanged: false,
          decisionLabelChanged: false,
          priorityChanged: false,
          leftStateLabel: "unknown",
          rightStateLabel: "unknown",
          leftDecisionLabel: "unknown",
          rightDecisionLabel: "unknown",
          leftPriority: "unknown",
          rightPriority: "unknown",
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
          "Comparison could not be completed because the request was invalid.",
        servedAt: new Date().toISOString(),
        error: {
          code: "BAD_REQUEST",
          message: "Missing required body fields: leftRecordId, rightRecordId.",
        },
      },
      { status: 400 }
    );
  }

  const envelope = await compareRecordsById({
    leftRecordId,
    rightRecordId,
  });

  return NextResponse.json(envelope, {
    status: envelope.error ? 404 : 200,
  });
}
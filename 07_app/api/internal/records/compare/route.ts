import { compareRecordsEnvelope } from "../../../../../05_engine/api/api_record_service";

interface CompareRequestBody {
  leftRecordId?: string;
  rightRecordId?: string;
}

function badRequest(message: string, details?: Record<string, unknown>): Response {
  return Response.json(
    {
      responseType: "record_comparison",
      responseVersion: "1.0.0",
      leftRecordId: details?.leftRecordId ?? "unknown",
      rightRecordId: details?.rightRecordId ?? "unknown",
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
      executiveReading: "Comparison could not be completed because the request was invalid.",
      servedAt: new Date().toISOString(),
      error: {
        code: "BAD_REQUEST",
        message,
        details: details ?? {},
      },
    },
    { status: 400 }
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: CompareRequestBody;

  try {
    body = (await request.json()) as CompareRequestBody;
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const leftRecordId = body.leftRecordId ?? "";
  const rightRecordId = body.rightRecordId ?? "";

  if (!leftRecordId || !rightRecordId) {
    return badRequest(
      "Missing required body fields: leftRecordId, rightRecordId.",
      {
        leftRecordId,
        rightRecordId,
      }
    );
  }

  const envelope = compareRecordsEnvelope({
    leftRecordId,
    rightRecordId,
  });

  const statusCode = envelope.error ? 404 : 200;

  return Response.json(envelope, { status: statusCode });
}
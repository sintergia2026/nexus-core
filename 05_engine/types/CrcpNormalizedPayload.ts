import { CrcpContext, CrcpAnswerValue } from "./CrcpIntakePayload";

export interface NormalizedMetric {
  question_id: string;
  domain: string;
  subdomain: string;
  normalized_value: number;
  raw_value: CrcpAnswerValue;
  weight: number;
}

export interface CrcpNormalizedPayload {
  context: CrcpContext;
  metrics: NormalizedMetric[];
  normalized_at: string;
}
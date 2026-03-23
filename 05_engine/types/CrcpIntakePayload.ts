export type CrcpAnswerValue =
  | string
  | number
  | boolean
  | string[]
  | null;

export interface CrcpAnswer {
  question_id: string;
  section: string;
  value: CrcpAnswerValue;
}

export interface CrcpContext {
  organization_id: string;
  sector: string;
  subsector: string;
  country: string;
  city: string;
}

export interface CrcpIntakePayload {
  context: CrcpContext;
  answers: CrcpAnswer[];
  captured_at: string;
}
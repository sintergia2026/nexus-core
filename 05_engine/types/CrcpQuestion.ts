export type CrcpQuestionType =
  | "string"
  | "numeric"
  | "yes_no"
  | "scale_1_5"
  | "multi_select";

export type CrcpScoringDirection =
  | "positive"
  | "negative"
  | "neutral";

export interface CrcpQuestion {
  question_id: string;
  text: string;
  domain: string;
  subdomain: string;
  type: CrcpQuestionType;
  weight: number;
  cross_sector: boolean;
  applicable_sectors: string[];
  diagnostic_intent?: string;
  scoring_direction: CrcpScoringDirection;
}
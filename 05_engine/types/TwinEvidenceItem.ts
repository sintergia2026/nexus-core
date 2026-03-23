export type TwinEvidenceValue = string | number | boolean | null;

export type TwinEvidenceItem = {
  evidence_id: string;
  evidence_type:
    | "coverage"
    | "signals"
    | "constraints"
    | "gap"
    | "confidence"
    | "diagnostic_evidence";
  label: string;
  status: string;
  source_question_id?: string;
  linked_domain_id?: string;
  linked_role_id?: string;
  source_metric?: string;
  source_signal_code?: string;
  rationale?: string;
  value: TwinEvidenceValue;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};
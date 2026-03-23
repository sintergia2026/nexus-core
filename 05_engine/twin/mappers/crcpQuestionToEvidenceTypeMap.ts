export const CRCP_QUESTION_TO_EVIDENCE_TYPE_MAP: Record<
  string,
  {
    evidence_type: string;
    label: string;
    linked_domain: string;
  }
> = {
  ID_01: {
    evidence_type: "identity",
    label: "Business Identity",
    linked_domain: "governance",
  },
  ID_02: {
    evidence_type: "identity",
    label: "Sector Identity",
    linked_domain: "governance",
  },
  ID_06: {
    evidence_type: "trajectory",
    label: "Operating History",
    linked_domain: "operations",
  },
  ID_07: {
    evidence_type: "role_definition",
    label: "Operations Responsibility",
    linked_domain: "governance",
  },
  ID_08: {
    evidence_type: "revenue_channel",
    label: "Revenue Channel Structure",
    linked_domain: "commercial",
  },

  OPS_01: {
    evidence_type: "operations_signal",
    label: "Operational Breakdown Frequency",
    linked_domain: "operations",
  },
  OPS_02: {
    evidence_type: "operations_signal",
    label: "Execution Stability",
    linked_domain: "operations",
  },

  REP_01: {
    evidence_type: "reporting_signal",
    label: "Reporting Discipline",
    linked_domain: "reporting",
  },
  REP_02: {
    evidence_type: "reporting_signal",
    label: "Reporting Accuracy",
    linked_domain: "reporting",
  },

  FIN_01: {
    evidence_type: "financial_signal",
    label: "Financial Pressure",
    linked_domain: "finance",
  },
  FIN_02: {
    evidence_type: "financial_signal",
    label: "Financial Visibility",
    linked_domain: "finance",
  },

  SAL_01: {
    evidence_type: "commercial_signal",
    label: "Commercial Flow",
    linked_domain: "commercial",
  },
  SAL_02: {
    evidence_type: "commercial_signal",
    label: "Conversion Stability",
    linked_domain: "commercial",
  },

  PLN_01: {
    evidence_type: "planning_signal",
    label: "Planning Discipline",
    linked_domain: "governance",
  },
  PLN_04: {
    evidence_type: "planning_signal",
    label: "Reactive Planning Load",
    linked_domain: "governance",
  },
};
import { CrcpProgramAction } from "./crcp.types";

export const CRCP_TASK_LIBRARY: Record<string, CrcpProgramAction[]> = {
  operations: [
    {
      action_id: "crcp_ops_001",
      domain: "operations",
      title: "Enforce daily operating rhythm",
      description:
        "Install a basic operating cadence with opening, shift, and closing control points.",
      owner_role: "operations_lead",
      expected_outcome: "Reduce execution instability and increase process continuity.",
      phase: "stabilization",
    },
    {
      action_id: "crcp_ops_002",
      domain: "operations",
      title: "Standardize exception handling",
      description:
        "Define how recurring failures, delays, or bottlenecks must be escalated and resolved.",
      owner_role: "operations_lead",
      expected_outcome: "Reduce rework and improve recovery capability.",
      phase: "control",
    },
  ],

  reporting: [
    {
      action_id: "crcp_rep_001",
      domain: "reporting",
      title: "Establish minimum reporting discipline",
      description:
        "Implement daily and weekly reporting checkpoints for operational and financial visibility.",
      owner_role: "reporting_visibility",
      expected_outcome: "Increase visibility quality and evidence traceability.",
      phase: "containment",
    },
    {
      action_id: "crcp_rep_002",
      domain: "reporting",
      title: "Create single source of truth",
      description:
        "Consolidate core operational and financial reporting into one controlled reporting surface.",
      owner_role: "reporting_visibility",
      expected_outcome: "Reduce reporting conflict and improve decision confidence.",
      phase: "control",
    },
  ],

  finance: [
    {
      action_id: "crcp_fin_001",
      domain: "finance",
      title: "Restore cash visibility",
      description:
        "Create a minimum weekly cash position view and expose payment pressure points.",
      owner_role: "finance_control",
      expected_outcome: "Reduce financial opacity and increase cash awareness.",
      phase: "containment",
    },
    {
      action_id: "crcp_fin_002",
      domain: "finance",
      title: "Install cost-control discipline",
      description:
        "Introduce periodic review of cost leakage, expense disruption, and hidden margin erosion.",
      owner_role: "finance_control",
      expected_outcome: "Improve cost control and financial predictability.",
      phase: "stabilization",
    },
  ],

  commercial: [
    {
      action_id: "crcp_com_001",
      domain: "commercial",
      title: "Stabilize demand channels",
      description:
        "Review revenue channels, identify weak-performing channels, and reinforce the most stable ones.",
      owner_role: "founder_or_owner",
      expected_outcome: "Reduce commercial fragility and improve demand consistency.",
      phase: "containment",
    },
  ],

  governance: [
    {
      action_id: "crcp_gov_001",
      domain: "governance",
      title: "Clarify role accountability",
      description:
        "Define who owns operations, reporting, finance, and final decision control.",
      owner_role: "founder_or_owner",
      expected_outcome: "Reduce coordination ambiguity and improve execution control.",
      phase: "stabilization",
    },
  ],
};
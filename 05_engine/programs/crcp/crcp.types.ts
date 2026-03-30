export type CrcpProgramPriority = "P1" | "P2" | "P3";

export type CrcpProgramStatus =
  | "planned"
  | "active"
  | "in_progress"
  | "completed";

export type CrcpProgramPhase =
  | "containment"
  | "stabilization"
  | "control";

export type CrcpProgramAction = {
  action_id: string;
  domain: string;
  title: string;
  description: string;
  owner_role: string;
  expected_outcome: string;
  phase: CrcpProgramPhase;
};

export type CrcpProgram = {
  program_id: string;
  program_label: string;
  status: CrcpProgramStatus;
  recommended_priority: CrcpProgramPriority;
  current_phase: CrcpProgramPhase;
  target_state: string;
  target_domains: string[];
  actions: CrcpProgramAction[];
  rationale: string;
  generated_at: string;
};
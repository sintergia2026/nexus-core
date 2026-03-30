import { CrcpProgramPhase } from "./crcp.types";

export const CRCP_PHASES: Array<{
  phase: CrcpProgramPhase;
  label: string;
  objective: string;
}> = [
  {
    phase: "containment",
    label: "Containment",
    objective: "Stop structural deterioration and prevent further degradation.",
  },
  {
    phase: "stabilization",
    label: "Stabilization",
    objective: "Recover execution consistency and restore minimum control.",
  },
  {
    phase: "control",
    label: "Control",
    objective: "Install repeatable routines, visibility, and structural discipline.",
  },
];
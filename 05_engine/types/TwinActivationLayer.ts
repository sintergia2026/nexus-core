export interface TwinActivationLayer {
  activation_status: string;
  recommended_priority: "P1" | "P2" | "P3";
  recommended_program: string;
  next_step: string;
  activation_summary: string;
}
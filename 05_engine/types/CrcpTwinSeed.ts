import { CrcpBaselineScores } from "./CrcpBaselineScores";
import { CrcpConstraint, CrcpSignal, CrcpStateLabel } from "./CrcpDiagnosticSnapshot";
import { CrcpContext } from "./CrcpIntakePayload";

export interface CrcpTwinSeed {
  twin_seed_id: string;
  context: CrcpContext;
  baseline_state: {
    state_label: CrcpStateLabel;
    scores: CrcpBaselineScores;
  };
  active_signals: CrcpSignal[];
  active_constraints: CrcpConstraint[];
  structural_hypothesis: string;
  created_at: string;
}
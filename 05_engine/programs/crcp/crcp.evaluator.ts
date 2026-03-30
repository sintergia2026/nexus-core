import { TwinStructure } from "../../types/TwinStructure";
import { CrcpProgramAction, CrcpProgramPhase } from "./crcp.types";
import { CRCP_TASK_LIBRARY } from "./crcp.tasks";

type CrcpEvaluationResult = {
  target_domains: string[];
  actions: CrcpProgramAction[];
  rationale: string;
  current_phase: CrcpProgramPhase;
};

function inferPhaseFromTwin(twin: TwinStructure): CrcpProgramPhase {
  if (
    twin.root.state_label === "critical" ||
    twin.root.state_label === "fragile"
  ) {
    return "containment";
  }

  if (twin.root.state_label === "degraded") {
    return "stabilization";
  }

  return "control";
}

function getMaxTargetDomains(
  domains: TwinStructure["domains"],
  currentPhase: CrcpProgramPhase
): number {
  if (domains.length === 0) {
    return 1;
  }

  const criticalLikeCount = domains.filter(
    (domain) => typeof domain.score === "number" && domain.score < 45
  ).length;

  if (currentPhase === "containment") {
    return criticalLikeCount >= 2 ? 2 : 1;
  }

  if (currentPhase === "stabilization") {
    return criticalLikeCount >= 2 ? 3 : 2;
  }

  return Math.min(2, domains.length);
}

function filterActionsByPhase(
  actions: CrcpProgramAction[],
  currentPhase: CrcpProgramPhase
): CrcpProgramAction[] {
  return actions.filter((action) => action.phase === currentPhase);
}

function dedupeActions(actions: CrcpProgramAction[]): CrcpProgramAction[] {
  const seen = new Set<string>();

  return actions.filter((action) => {
    if (seen.has(action.action_id)) {
      return false;
    }

    seen.add(action.action_id);
    return true;
  });
}

function inferFallbackOwnerRole(domainName: string): string {
  if (domainName === "finance") return "finance_control";
  if (domainName === "operations") return "operations_lead";
  if (domainName === "reporting") return "reporting_visibility";
  if (domainName === "commercial") return "founder_or_owner";
  if (domainName === "governance") return "founder_or_owner";
  return "founder_or_owner";
}

function buildFallbackAction(
  domainName: string,
  currentPhase: CrcpProgramPhase
): CrcpProgramAction {
  return {
    action_id: `crcp_${domainName}_fallback_001`,
    domain: domainName,
    title: `Stabilize ${domainName}`,
    description: `Install minimum structural control actions for ${domainName}.`,
    owner_role: inferFallbackOwnerRole(domainName),
    expected_outcome: `Create an initial execution baseline for ${domainName}.`,
    phase: currentPhase,
  };
}

function getScoredDomains(twin: TwinStructure): TwinStructure["domains"] {
  return twin.domains
    .filter((domain) => typeof domain.score === "number")
    .sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
}

export function evaluateCrcpProgram(
  twin: TwinStructure
): CrcpEvaluationResult {
  const current_phase = inferPhaseFromTwin(twin);
  const scoredDomains = getScoredDomains(twin);

  const weakDomains = scoredDomains.filter(
    (domain) => typeof domain.score === "number" && domain.score < 55
  );

  const candidateDomains =
    weakDomains.length > 0 ? weakDomains : scoredDomains;

  const maxTargetDomains = getMaxTargetDomains(
    candidateDomains,
    current_phase
  );

  const selectedDomains = candidateDomains.slice(
    0,
    Math.max(1, maxTargetDomains)
  );

  const target_domains = selectedDomains.map((domain) => domain.domain_name);

  let actions: CrcpProgramAction[] = dedupeActions(
    selectedDomains.flatMap((domain) => {
      const domainActions = CRCP_TASK_LIBRARY[domain.domain_name] ?? [];
      const phaseMatchedActions = filterActionsByPhase(
        domainActions,
        current_phase
      );

      if (phaseMatchedActions.length > 0) {
        return phaseMatchedActions;
      }

      return [buildFallbackAction(domain.domain_name, current_phase)];
    })
  );

  if (actions.length === 0 && selectedDomains.length > 0) {
    actions = selectedDomains.map((domain) =>
      buildFallbackAction(domain.domain_name, current_phase)
    );
  }

  if (actions.length === 0) {
    actions = [
      buildFallbackAction("governance", current_phase),
    ];
  }

  const rationale =
    weakDomains.length > 0
      ? `CRCP activated in ${current_phase} phase because ${selectedDomains.length} priority structural domain(s) are below the minimum control threshold: ${target_domains.join(
          ", "
        )}.`
      : `CRCP activated in ${current_phase} phase through mandatory structural reinforcement. No domain fell below the minimum control threshold, but the weakest domain(s) still require active intervention: ${target_domains.join(
          ", "
        )}.`;

  return {
    target_domains,
    actions,
    rationale,
    current_phase,
  };
}
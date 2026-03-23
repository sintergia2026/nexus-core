import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";
import { CrcpNormalizedPayload } from "../../types/CrcpNormalizedPayload";
import { TwinSeedV2 } from "../../types/TwinSeedV2";
import { TwinStructure } from "../../types/TwinStructure";
import { TwinRoot } from "../../types/TwinRoot";
import { TwinDomainNode } from "../../types/TwinDomainNode";
import { TwinRoleNode } from "../../types/TwinRoleNode";
import { TwinActivationLayer } from "../../types/TwinActivationLayer";
import { TwinSimulationLayer } from "../../types/TwinSimulationLayer";
import { TwinDependencyEdge } from "../../types/TwinDependencyEdge";
import { TwinEvidenceItem } from "../../types/TwinEvidenceItem";

import { buildSectorRoleNodes } from "./buildSectorRoleNodes";
import { buildTwinEvidenceLayer } from "./buildTwinEvidenceLayer";

type BuildTwinStructureInput = {
  twin_seed_v2: TwinSeedV2;
  intake?: CrcpIntakePayload;
  normalized?: CrcpNormalizedPayload;
};

function sanitizeSegment(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildTwinId(twinSeedV2: TwinSeedV2): string {
  return [
    "twin",
    sanitizeSegment(twinSeedV2.context.organization_id),
    sanitizeSegment(twinSeedV2.twin_version),
    sanitizeSegment(twinSeedV2.created_at),
  ].join("::");
}

function buildTwinName(twinSeedV2: TwinSeedV2): string {
  const org = twinSeedV2.context.organization_id || "unknown_org";
  const sector = twinSeedV2.context.sector || "general";
  return `${org} / ${sector} / structural twin`;
}

function buildRoot(twinSeedV2: TwinSeedV2): TwinRoot {
  return {
    entity_id: twinSeedV2.context.organization_id,
    legal_name: twinSeedV2.context.organization_id,
    display_name: twinSeedV2.context.organization_id,
    sector: twinSeedV2.context.sector,
    subsector: twinSeedV2.context.subsector,
    country: twinSeedV2.context.country,
    city: twinSeedV2.context.city,
    lifecycle_stage: twinSeedV2.activation_path.lifecycle_stage,
    state_label: twinSeedV2.baseline_state.state_label,
  };
}

function domainStatusFromScore(score: number): string {
  if (score < 45) return "fragile";
  if (score < 65) return "degraded";
  return "active";
}

function buildDomainNodes(twinSeedV2: TwinSeedV2): TwinDomainNode[] {
  const org = sanitizeSegment(twinSeedV2.context.organization_id);

  const domains: Array<{
    domain_name: string;
    domain_label: string;
    score: number;
    summary: string;
  }> = [
    {
      domain_name: "operations",
      domain_label: "Operations",
      score: twinSeedV2.structural_vector.execution,
      summary:
        "Execution rhythm, procedural continuity, and operating stability.",
    },
    {
      domain_name: "reporting",
      domain_label: "Reporting",
      score: twinSeedV2.structural_vector.visibility,
      summary:
        "Visibility quality, evidence traceability, and reporting integrity.",
    },
    {
      domain_name: "finance",
      domain_label: "Finance",
      score: twinSeedV2.structural_vector.finance,
      summary:
        "Financial control, margin visibility, and pressure exposure.",
    },
    {
      domain_name: "commercial",
      domain_label: "Commercial",
      score: twinSeedV2.structural_vector.commercial,
      summary:
        "Demand quality, commercial consistency, and conversion resilience.",
    },
    {
      domain_name: "governance",
      domain_label: "Governance",
      score: twinSeedV2.structural_vector.coordination,
      summary:
        "Coordination capacity, leadership structure, and control coherence.",
    },
  ];

  return domains.map((domain) => ({
    domain_id: `domain::${org}::${sanitizeSegment(domain.domain_name)}`,
    domain_name: domain.domain_name,
    domain_label: domain.domain_label,
    status: domainStatusFromScore(domain.score),
    owner_role_id: undefined,
    score: Number(domain.score.toFixed(2)),
    summary: domain.summary,
  }));
}

function attachDomainOwners(
  domains: TwinDomainNode[],
  roles: TwinRoleNode[]
): TwinDomainNode[] {
  return domains.map((domain) => {
    const owner = roles.find((role) => role.domain_id === domain.domain_id);

    return {
      ...domain,
      owner_role_id: owner?.role_id,
    };
  });
}

function buildActivationLayer(
  twinSeedV2: TwinSeedV2
): TwinActivationLayer {
  return {
    activation_status:
      twinSeedV2.activation_path.recommended_priority === "P1"
        ? "active"
        : "planned",
    recommended_priority: twinSeedV2.activation_path.recommended_priority,
    recommended_program: twinSeedV2.activation_path.recommended_program,
    next_step: twinSeedV2.activation_path.next_step,
    activation_summary: [
      `Lifecycle stage: ${twinSeedV2.activation_path.lifecycle_stage}.`,
      `Recommended program: ${twinSeedV2.activation_path.recommended_program}.`,
      `Priority: ${twinSeedV2.activation_path.recommended_priority}.`,
      `Confidence: ${twinSeedV2.twin_confidence.level} (${twinSeedV2.twin_confidence.score.toFixed(
        2
      )}).`,
    ].join(" "),
  };
}

function buildSimulationLayer(
  twinSeedV2: TwinSeedV2
): TwinSimulationLayer {
  return {
    simulation_status: "planned",
    available_modes: [
      "role_reassignment",
      "structural_gap_closure",
      "operational_stress_test",
      "financial_pressure_response",
      "commercial_downturn_response",
    ],
    simulation_summary: [
      "Prepared as future layer for scenario testing.",
      `Current baseline state: ${twinSeedV2.baseline_state.state_label}.`,
      `Weakest dimension: ${twinSeedV2.gap_vector.weakest_dimension}.`,
      `Recommended priority: ${twinSeedV2.activation_path.recommended_priority}.`,
    ].join(" "),
  };
}

function buildDependencies(
  root: TwinRoot,
  domains: TwinDomainNode[],
  roles: TwinRoleNode[]
): TwinDependencyEdge[] {
  const edges: TwinDependencyEdge[] = [];

  for (const domain of domains) {
    edges.push({
      edge_id: `edge::root::${sanitizeSegment(domain.domain_name)}`,
      from_node_id: root.entity_id,
      to_node_id: domain.domain_id,
      relation: "contains_domain",
      status: "active",
    });
  }

  for (const role of roles) {
    if (role.domain_id) {
      edges.push({
        edge_id: `edge::domain_role::${sanitizeSegment(role.role_name)}`,
        from_node_id: role.domain_id,
        to_node_id: role.role_id,
        relation: "contains_role",
        status: "active",
      });
    }
  }

  const domainByName = new Map(
    domains.map((domain) => [domain.domain_name, domain.domain_id])
  );

  const domainRelations: Array<[string, string]> = [
    ["operations", "reporting"],
    ["reporting", "finance"],
    ["finance", "governance"],
    ["commercial", "operations"],
    ["governance", "operations"],
    ["governance", "finance"],
    ["governance", "reporting"],
    ["governance", "commercial"],
  ];

  for (const [fromName, toName] of domainRelations) {
    const fromId = domainByName.get(fromName);
    const toId = domainByName.get(toName);

    if (!fromId || !toId) continue;

    edges.push({
      edge_id: `edge::domain_dep::${sanitizeSegment(fromName)}::${sanitizeSegment(
        toName
      )}`,
      from_node_id: fromId,
      to_node_id: toId,
      relation: "depends_on_domain",
      status: "active",
    });
  }

  return edges;
}

function normalizeEvidenceLayer(input: {
  twin_seed_v2: TwinSeedV2;
  intake?: CrcpIntakePayload;
  normalized?: CrcpNormalizedPayload;
  domains: TwinDomainNode[];
  roles: TwinRoleNode[];
}): TwinEvidenceItem[] {
  const domainIdByName = Object.fromEntries(
    input.domains.map((domain) => [domain.domain_name, domain.domain_id])
  ) as Record<string, string>;

  const roleIdByName = Object.fromEntries(
    input.roles.map((role) => [role.role_name, role.role_id])
  ) as Record<string, string>;

  const rawEvidence = buildTwinEvidenceLayer({
    twin_seed_v2: input.twin_seed_v2,
    intake: input.intake,
    normalized: input.normalized,
    domain_id_by_name: domainIdByName,
    role_id_by_name: roleIdByName,
  });

  if (!Array.isArray(rawEvidence) || rawEvidence.length === 0) {
    return [];
  }

  return rawEvidence;
}

export function buildTwinStructure({
  twin_seed_v2,
  intake,
  normalized,
}: BuildTwinStructureInput): TwinStructure {
  const root = buildRoot(twin_seed_v2);
  const baseDomains = buildDomainNodes(twin_seed_v2);
  const roles = buildSectorRoleNodes(twin_seed_v2, baseDomains);
  const domains = attachDomainOwners(baseDomains, roles);
  const evidence = normalizeEvidenceLayer({
    twin_seed_v2,
    intake,
    normalized,
    domains,
    roles,
  });
  const activation = buildActivationLayer(twin_seed_v2);
  const simulation = buildSimulationLayer(twin_seed_v2);
  const dependencies = buildDependencies(root, domains, roles);
  const now = new Date().toISOString();

  return {
    twin_id: buildTwinId(twin_seed_v2),
    twin_name: buildTwinName(twin_seed_v2),
    twin_version: twin_seed_v2.twin_version,
    lineage_id: twin_seed_v2.lineage_id,
    root,
    domains,
    roles,
    evidence,
    dependencies,
    activation,
    simulation,
    created_at: now,
    updated_at: now,
  };
}
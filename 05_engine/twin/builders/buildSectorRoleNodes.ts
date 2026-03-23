import { TwinRoleNode } from "../../types/TwinRoleNode";
import { TwinSeedV2 } from "../../types/TwinSeedV2";
import { TwinDomainNode } from "../../types/TwinDomainNode";

type RoleTemplate = {
  role_name: string;
  role_label: string;
  domain_name: string;
  responsibility_summary: string;
};

const COMMON_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    role_name: "founder_or_owner",
    role_label: "Founder / Owner",
    domain_name: "governance",
    responsibility_summary:
      "Owns strategic direction, resource decisions, and final business accountability.",
  },
  {
    role_name: "operations_lead",
    role_label: "Operations Lead",
    domain_name: "operations",
    responsibility_summary:
      "Owns execution rhythm, process continuity, and cross-functional coordination.",
  },
  {
    role_name: "finance_control",
    role_label: "Finance Control",
    domain_name: "finance",
    responsibility_summary:
      "Owns cash discipline, margin visibility, cost control, and financial reporting reliability.",
  },
  {
    role_name: "reporting_visibility",
    role_label: "Reporting Visibility",
    domain_name: "reporting",
    responsibility_summary:
      "Owns data capture cadence, reporting consistency, and evidence traceability.",
  },
];

const SECTOR_ROLE_TEMPLATES: Record<string, RoleTemplate[]> = {
  restaurant: [
    {
      role_name: "floor_or_service_lead",
      role_label: "Floor / Service Lead",
      domain_name: "operations",
      responsibility_summary:
        "Owns service flow, shift execution, guest throughput, and front-of-house discipline.",
    },
    {
      role_name: "kitchen_or_production_lead",
      role_label: "Kitchen / Production Lead",
      domain_name: "operations",
      responsibility_summary:
        "Owns production consistency, ticket flow, prep control, and execution under pressure.",
    },
    {
      role_name: "inventory_control",
      role_label: "Inventory Control",
      domain_name: "finance",
      responsibility_summary:
        "Owns stock movement visibility, waste discipline, and purchase-control integrity.",
    },
  ],
  general: [
    {
      role_name: "general_execution_control",
      role_label: "General Execution Control",
      domain_name: "operations",
      responsibility_summary:
        "Owns execution discipline in mixed or unclassified operational environments.",
    },
  ],
};

function sanitizeSegment(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSector(value?: string): string {
  const safe = sanitizeSegment(value || "");
  return safe || "general";
}

function roleStatusFromDomainScore(score?: number): string {
  if (typeof score !== "number") return "pending";
  if (score < 45) return "fragile";
  if (score < 65) return "degraded";
  return "active";
}

function resolveDomainId(
  domains: TwinDomainNode[],
  domainName: string
): string | undefined {
  return domains.find((domain) => domain.domain_name === domainName)?.domain_id;
}

export function buildSectorRoleNodes(
  twinSeedV2: TwinSeedV2,
  domains: TwinDomainNode[]
): TwinRoleNode[] {
  const sector = normalizeSector(twinSeedV2.context.sector);
  const sectorRoles =
    SECTOR_ROLE_TEMPLATES[sector] ?? SECTOR_ROLE_TEMPLATES.general;

  const merged = [...COMMON_ROLE_TEMPLATES, ...sectorRoles];
  const org = sanitizeSegment(twinSeedV2.context.organization_id);

  return merged.map((role) => {
    const domain = domains.find((d) => d.domain_name === role.domain_name);

    return {
      role_id: `role::${org}::${sanitizeSegment(role.role_name)}`,
      role_name: role.role_name,
      role_label: role.role_label,
      status: roleStatusFromDomainScore(domain?.score),
      domain_id: resolveDomainId(domains, role.domain_name),
      responsibility_summary: role.responsibility_summary,
    };
  });
}
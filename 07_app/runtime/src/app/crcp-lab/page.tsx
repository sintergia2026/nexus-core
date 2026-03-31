"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import AppShell from "@/components/app-shell/AppShell";
import styles from "../internal-records-view/page.module.css";

type CrcpAnswerValue = string | number | boolean | string[];

type CrcpAnswer = {
  question_id: string;
  section: string;
  value: CrcpAnswerValue;
};

type ValidationIssue = {
  code: string;
  field: string;
  message: string;
};

type TwinSeedV2 = {
  twin_seed_id: string;
  twin_version: "v2";
  lineage_id: string;
  source_snapshot_id?: string;
  context: {
    organization_id: string;
    sector: string;
    subsector?: string;
    country?: string;
    city?: string;
  };
  baseline_state: {
    state_label: string;
    scores: {
      operational_maturity: number;
      financial_pressure: number;
      reporting_reliability: number;
      structural_risk: number;
      commercial_strength: number;
    };
    decision: {
      decision_label: string;
      priority: "P1" | "P2" | "P3";
      readiness_level: "low" | "medium" | "high";
    };
  };
  active_signals: Array<{
    code: string;
    severity: string;
    source_metric?: string;
  }>;
  active_constraints: Array<{
    code: string;
    severity: string;
  }>;
  structural_hypothesis: string;
  structural_vector: {
    execution: number;
    visibility: number;
    finance: number;
    commercial: number;
    coordination: number;
  };
  gap_vector: {
    weakest_dimension: string;
    weakest_score: number;
    second_weakest_dimension?: string;
    second_weakest_score?: number;
    gap_severity: number;
  };
  twin_confidence: {
    score: number;
    level: "low" | "medium" | "high";
    rationale: string;
  };
  activation_path: {
    next_step: string;
    recommended_program: string;
    recommended_priority: "P1" | "P2" | "P3";
    lifecycle_stage:
      | "seeded"
      | "stabilizing"
      | "standardizing"
      | "optimizing"
      | "monitoring";
  };
  evidence_summary: {
    answered_questions: number;
    total_questions: number;
    coverage_percent: number;
    major_signal_count: number;
    major_constraint_count: number;
  };
  created_at: string;
};

type TwinRoot = {
  entity_id: string;
  legal_name: string;
  display_name: string;
  sector: string;
  subsector?: string;
  country?: string;
  city?: string;
  lifecycle_stage: string;
  state_label: string;
};

type TwinDomainNode = {
  domain_id: string;
  domain_name: string;
  domain_label: string;
  status: string;
  owner_role_id?: string;
  score?: number;
  summary?: string;
};

type TwinRoleNode = {
  role_id: string;
  role_name: string;
  role_label: string;
  status: string;
  domain_id?: string;
  responsibility_summary?: string;
};

type TwinEvidenceItem = {
  evidence_id: string;
  evidence_type: string;
  label: string;
  status: string;
  linked_domain_id?: string;
  linked_role_id?: string;
  source_question_id?: string;
  value?: string | number | boolean | string[] | null;
};

type TwinDependencyEdge = {
  edge_id: string;
  from_node_id: string;
  to_node_id: string;
  relation: string;
  status?: string;
};

type TwinActivationLayer = {
  activation_status: string;
  recommended_priority: string;
  recommended_program: string;
  next_step: string;
  activation_summary: string;
};

type TwinSimulationLayer = {
  simulation_status: string;
  available_modes: string[];
  simulation_summary: string;
};

type TwinStructure = {
  twin_id: string;
  twin_name: string;
  twin_version: string;
  lineage_id: string;
  root: TwinRoot;
  domains: TwinDomainNode[];
  roles: TwinRoleNode[];
  evidence: TwinEvidenceItem[];
  dependencies: TwinDependencyEdge[];
  activation: TwinActivationLayer;
  simulation?: TwinSimulationLayer;
  created_at: string;
  updated_at: string;
};

type CrcpProgram = {
  program_id: string;
  program_label: string;
  status: string;
  recommended_priority: "P1" | "P2" | "P3";
  current_phase: "containment" | "stabilization" | "control";
  target_state: string;
  target_domains: string[];
  actions: Array<{
    action_id: string;
    domain: string;
    title: string;
    description: string;
    owner_role: string;
    expected_outcome: string;
    phase: string;
  }>;
  rationale: string;
  generated_at: string;
};

type CrcpRunApiResponse = {
  ok: boolean;
  result: null | {
  crcp_program?: CrcpProgram;
    intake: {
      context: {
        organization_id: string;
        sector: string;
        subsector?: string;
        country?: string;
        city?: string;
      };
      answers: Array<{
        question_id: string;
        section: string;
        value: unknown;
      }>;
      captured_at: string;
    };
    normalized: {
      context: {
        organization_id: string;
        sector: string;
        subsector?: string;
        country?: string;
        city?: string;
      };
      metrics: Array<{
        question_id: string;
        domain: string;
        subdomain: string;
        normalized_value: number;
        raw_value: unknown;
        weight: number;
      }>;
      normalized_at: string;
    } | null;
    scores: {
      operational_maturity: number;
      financial_pressure: number;
      reporting_reliability: number;
      structural_risk: number;
      commercial_strength: number;
    } | null;
    decision: {
      decision_label: string;
      priority: string;
      readiness_level: string;
    } | null;
    snapshot: {
      context: {
        organization_id: string;
        sector: string;
        subsector?: string;
        country?: string;
        city?: string;
      };
      scores: {
        operational_maturity: number;
        financial_pressure: number;
        reporting_reliability: number;
        structural_risk: number;
        commercial_strength: number;
      };
      decision: {
        decision_label: string;
        priority: string;
        readiness_level: string;
      };
      state_label: string;
      active_signals: Array<{
        code: string;
        severity: string;
        source_metric?: string;
      }>;
      active_constraints: Array<{
        code: string;
        severity: string;
      }>;
      executive_summary: string;
      created_at: string;
    } | null;
    twin_seed: {
      twin_seed_id: string;
      context: {
        organization_id: string;
        sector: string;
        subsector?: string;
        country?: string;
        city?: string;
      };
      baseline_state: {
        state_label: string;
        scores: {
          operational_maturity: number;
          financial_pressure: number;
          reporting_reliability: number;
          structural_risk: number;
          commercial_strength: number;
        };
      };
      active_signals: Array<{
        code: string;
        severity: string;
        source_metric?: string;
      }>;
      active_constraints: Array<{
        code: string;
        severity: string;
      }>;
      structural_hypothesis: string;
      created_at: string;
    } | null;
    twin_seed_v2: TwinSeedV2 | null;
    twin_structure: TwinStructure | null;
    persisted?: {
      intake_path: string;
      snapshot_path: string;
      twin_seed_path: string;
    };
    executed_at: string;
    validation_issues?: ValidationIssue[];
  };
  error: string | null;
};

type CrcpQuestion = {
  question_id: string;
  text: string;
  domain: string;
  subdomain: string;
  type: string;
  weight: number;
  cross_sector: boolean;
  applicable_sectors: string[];
  scoring_direction?: string;
};

type CrcpQuestionsApiResponse = {
  ok: boolean;
  result: null | {
    sector: string;
    identityQuestions: CrcpQuestion[];
    adaptiveQuestions: CrcpQuestion[];
    questionCount: number;
  };
  error: string | null;
};

type MetadataState = {
  sector: string;
  subsector: string;
  country: string;
  city: string;
  business_name: string;
};

type AnswerMap = Record<string, CrcpAnswerValue | undefined>;

type DomainStat = {
  domain: string;
  total: number;
  answered: number;
  percent: number;
  state: "pending" | "in_progress" | "complete";
};

type CaptureSummaryItem = {
  label: string;
  value: string;
};

type ScoreBarItem = {
  label: string;
  value: number;
};

type ExecutionActionStatus =
  | "pending"
  | "ready"
  | "in_progress"
  | "completed";

type ExecutionTrackerItem = {
  action_id: string;
  title: string;
  domain: string;
  owner_role: string;
  phase: string;
  expected_outcome: string;
  status: ExecutionActionStatus;
};

type HeaderSnapshotItem = {
  label: string;
  value: string;
};

type SimulationProfile =
  | "critical"
  | "fragile"
  | "average"
  | "strong"
  | "elite";

  type RepoNodeType =
  | "root"
  | "domain"
  | "role"
  | "evidence"
  | "execution"
  | "automation"
  | "commercial"
  | "activation"
  | "simulation"
  | "lineage"
  | "governance";

type SelectedRepoNode = {
  node_type: RepoNodeType;
  node_id: string;
  node_label: string;
};

type RepoTreeNode = {
  id: string;
  label: string;
  node_type:
    | "folder"
    | "file"
    | "root"
    | "domain"
    | "role"
    | "evidence"
    | "execution"
    | "automation"
    | "commercial"
    | "activation"
    | "simulation"
    | "lineage"
    | "governance";
  status?: string;
  children?: RepoTreeNode[];
  selectable?: boolean;
};

const COUNTRY_OPTIONS: Record<string, { label: string; cities: string[] }> = {
  CO: {
    label: "Colombia",
    cities: ["Bogota", "Medellin", "Cali", "Barranquilla", "Cartagena"],
  },
  US: {
    label: "United States",
    cities: ["Denver", "Miami", "New York", "Los Angeles", "Houston"],
  },
  MX: {
    label: "Mexico",
    cities: ["CDMX", "Monterrey", "Guadalajara", "Puebla", "Tijuana"],
  },
  PE: {
    label: "Peru",
    cities: ["Lima", "Arequipa", "Cusco", "Trujillo"],
  },
  CL: {
    label: "Chile",
    cities: ["Santiago", "Valparaiso", "Concepcion", "Antofagasta"],
  },
};

const SUBSECTOR_OPTIONS: Record<string, string[]> = {
  restaurant: [
    "casual_dining",
    "fast_casual",
    "fine_dining",
    "cafe",
    "bakery",
  ],
  retail: ["convenience", "apparel", "grocery", "electronics", "specialty"],
  services: ["handyman", "cleaning", "agency", "consulting", "maintenance"],
  construction: [
    "residential",
    "commercial",
    "subcontractor",
    "general_contractor",
    "remodeling",
  ],
  health: ["clinic", "dental", "therapy", "outpatient", "urgent_care"],
  logistics: ["last_mile", "warehousing", "transport", "dispatch", "fleet_ops"],
  technology: [
    "saas",
    "agency_tech",
    "dev_shop",
    "managed_services",
    "platform",
  ],
  education: [
    "academy",
    "tutoring",
    "training_center",
    "school_support",
    "institute",
  ],
  hospitality: [
    "hotel",
    "hostel",
    "tour_agency",
    "vacation_rental",
    "event_services",
  ],
  general: [
    "general_service",
    "mixed_operations",
    "other",
    "unspecified",
    "custom",
  ],
};

const INITIAL_METADATA: MetadataState = {
  sector: "restaurant",
  subsector: "casual_dining",
  country: "CO",
  city: "Bogota",
  business_name: "Demo Restaurant",
};

const INITIAL_ANSWER_MAP: AnswerMap = {};

const SINGLE_SELECT_OPTIONS: Record<string, string[]> = {
  ID_06: [
    "less_than_1_year",
    "1_to_3_years",
    "3_to_5_years",
    "5_to_10_years",
    "10_plus_years",
  ],
  ID_07: ["owner", "manager", "operator", "shared_responsibility", "other"],
  ID_08: [
    "walk_in",
    "appointments",
    "contracts",
    "online",
    "delivery",
    "mixed",
  ],
};

const DOMAIN_LABELS: Record<string, string> = {
  identity: "Identity",
  operations: "Operations",
  staffing: "Staffing",
  reporting: "Reporting",
  finance: "Finance",
  sales: "Sales",
  customer_flow: "Customer Flow",
  inventory: "Inventory",
  planning: "Planning",
};

const SIMULATION_PROFILE_OPTIONS: SimulationProfile[] = [
  "critical",
  "fragile",
  "average",
  "strong",
  "elite",
];

const inputStyle: CSSProperties = {
  width: "100%",
  background: "#182235",
  border: "1px solid #2b3955",
  color: "#e5eefc",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
};

const disabledInputStyle: CSSProperties = {
  ...inputStyle,
  opacity: 0.7,
  cursor: "not-allowed",
};

const sectionBlockStyle: CSSProperties = {
  background: "#182235",
  border: "1px solid #2b3955",
  borderRadius: 12,
  padding: "14px 16px",
};

const actionButtonBaseStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid #334155",
  color: "#e2e8f0",
  fontWeight: 700,
};

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Chips({ values }: { values: string[] }) {
  if (!values || values.length === 0) {
    return <div className={styles.empty}>(none)</div>;
  }

  return (
    <div className={styles.chips}>
      {values.map((value) => (
        <span key={value} className={styles.chip}>
          {value}
        </span>
      ))}
    </div>
  );
}

function toneClass(value?: string): string {
  const v = String(value ?? "").toLowerCase();

  if (
    v === "critical" ||
    v === "p1" ||
    v === "stabilize_now" ||
    v === "negative" ||
    v === "pending" ||
    v === "low" ||
    v === "blocked" ||
    v === "fragile"
  ) {
    return `${styles.status} ${styles.statusSuperseded}`;
  }

  if (
    v === "active" ||
    v === "stable" ||
    v === "high" ||
    v === "complete" ||
    v === "completed" ||
    v === "ready" ||
    v === "positive" ||
    v === "answered" ||
    v === "medium" ||
    v === "valid" ||
    v === "unlocked" ||
    v === "planned" ||
    v === "in_progress" ||
    v === "containment" ||
    v === "stabilization" ||
    v === "control"
  ) {
    return `${styles.status} ${styles.statusActive}`;
  }

  return styles.status;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12);
}

function getRandomItem<T>(items: T[]): T {     
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomInteger(min: number, max: number): number { 
  const safeMin = Math.ceil(min);
  const safeMax = Math.floor(max);
  return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
}

function buildOrganizationId(
  businessName: string,
  sector: string,
  seed: string
): string {
  const sectorPart = slugify(sector || "org");
  const namePart = slugify(businessName || "client");
  return `org-${sectorPart}-${namePart || "client"}-${seed}`;
}

function isAnswered(value: CrcpAnswerValue | undefined): boolean {
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

function normalizeMultiSelectText(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildRandomAnswerValue(
  question: CrcpQuestion,
  metadata: MetadataState
): CrcpAnswerValue | undefined {
  if (question.question_id === "ID_01") {
    return metadata.business_name;
  }

  if (question.question_id === "ID_02") {
    return [metadata.sector];
  }

  if (question.type === "yes_no") {
    return getRandomItem(["yes", "no"]);
  }

  if (question.type === "scale_1_5") {
    return getRandomInteger(1, 5);      
  }

  if (question.type === "numeric") {
    return getRandomInteger(1, 100);  
  }

  if (question.type === "multi_select") {
    const options = SINGLE_SELECT_OPTIONS[question.question_id];

    if (options && options.length > 0) {
      return getRandomItem(options);      
    }

    return ["demo_value_1", "demo_value_2"];
  }

  return `demo_${slugify(question.question_id)}`;
}

function buildRandomAnswerMap(
  questions: CrcpQuestion[],
  metadata: MetadataState
): AnswerMap {
  const nextAnswers: AnswerMap = {};

  for (const question of questions) {
    if (question.question_id === "ID_01" || question.question_id === "ID_02") {
      continue;
    }

    nextAnswers[question.question_id] = buildRandomAnswerValue(
      question,
      metadata
    );
  }

  return nextAnswers;
}

function getQuestionValue(
  question: CrcpQuestion,
  metadata: MetadataState,
  answers: AnswerMap
): CrcpAnswerValue | undefined {
  if (question.question_id === "ID_01") {
    return metadata.business_name;
  }

  if (question.question_id === "ID_02") {
    return [metadata.sector];
  }

  return answers[question.question_id];
}

function getQuestionPayloadValue(
  question: CrcpQuestion,
  metadata: MetadataState,
  answers: AnswerMap
): CrcpAnswerValue | undefined {
  return getQuestionValue(question, metadata, answers);
}

function buildPayloadAnswers(
  metadata: MetadataState,
  questions: CrcpQuestion[],
  answers: AnswerMap
): CrcpAnswer[] {
  return questions
    .map((question) => {
      const value = getQuestionPayloadValue(question, metadata, answers);

      if (!isAnswered(value)) {
        return null;
      }

      return {
        question_id: question.question_id,
        section: question.domain,
        value,
      };
    })
    .filter((item): item is CrcpAnswer => Boolean(item));
}

function buildRuntimePayload(
  organizationId: string,
  metadata: MetadataState,
  questions: CrcpQuestion[],
  answers: AnswerMap
) {
  return {
    context: {
      organization_id: organizationId,
      sector: metadata.sector,
      subsector: metadata.subsector,
      country: metadata.country,
      city: metadata.city,
    },
    answers: buildPayloadAnswers(metadata, questions, answers),
    captured_at: new Date().toISOString(),
  };
}

function buildSimulatedAnswerValue(
  question: CrcpQuestion,
  metadata: MetadataState,
  profile: SimulationProfile
): CrcpAnswerValue | undefined {
  if (question.question_id === "ID_01") {
    return metadata.business_name;
  }

  if (question.question_id === "ID_02") {
    return [metadata.sector];
  }

  if (question.type === "yes_no") {
    if (profile === "critical") return "no";
    if (profile === "fragile") return getRandomItem(["no", "no", "yes"]);
    if (profile === "average") return getRandomItem(["yes", "no"]);
    if (profile === "strong") return getRandomItem(["yes", "yes", "no"]);
    if (profile === "elite") return "yes";
  }

  if (question.type === "scale_1_5") {
    if (profile === "critical") return getRandomInteger(1, 2);
    if (profile === "fragile") return getRandomInteger(2, 3);
    if (profile === "average") return getRandomInteger(3, 4);
    if (profile === "strong") return getRandomInteger(4, 5);
    if (profile === "elite") return 5;
  }

  if (question.type === "numeric") {
    if (profile === "critical") return getRandomInteger(1, 25);
    if (profile === "fragile") return getRandomInteger(20, 45);
    if (profile === "average") return getRandomInteger(40, 70);
    if (profile === "strong") return getRandomInteger(65, 90);
    if (profile === "elite") return getRandomInteger(85, 100);
  }

  if (question.type === "multi_select") {
    const options = SINGLE_SELECT_OPTIONS[question.question_id];

    if (options && options.length > 0) {
      return getRandomItem(options);
    }

    if (profile === "critical") {
      return ["manual", "unstable"];
    }

    if (profile === "fragile") {
      return ["partial_control", "reactive"];
    }

    if (profile === "average") {
      return ["baseline_process", "mixed_visibility"];
    }

    if (profile === "strong") {
      return ["structured", "measured"];
    }

    return ["structured", "measured", "optimized"];
  }

  if (profile === "critical") {
    return `critical_${slugify(question.question_id)}`;
  }

  if (profile === "fragile") {
    return `fragile_${slugify(question.question_id)}`;
  }

  if (profile === "average") {
    return `average_${slugify(question.question_id)}`;
  }

  if (profile === "strong") {
    return `strong_${slugify(question.question_id)}`;
  }

  return `elite_${slugify(question.question_id)}`;
}

function buildSimulatedAnswerMap(
  questions: CrcpQuestion[],
  metadata: MetadataState,
  profile: SimulationProfile
): AnswerMap {
  const nextAnswers: AnswerMap = {};

  for (const question of questions) {
    if (question.question_id === "ID_01" || question.question_id === "ID_02") {
      continue;
    }

    nextAnswers[question.question_id] = buildSimulatedAnswerValue(
      question,
      metadata,
      profile
    );
  }

  return nextAnswers;
}

function FieldShell({
  label,
  children,
  helper,
}: {
  label: string;
  children: ReactNode;
  helper?: string;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div className={styles.contextLabel}>{label}</div>
      {children}
      {helper ? (
        <div style={{ fontSize: 12, color: "#94a3b8" }}>{helper}</div>
      ) : null}
    </div>
  );
}

function getExecutionProgressPercent(
  items: ExecutionTrackerItem[]
): number {
  if (!items.length) return 0;

  const score = items.reduce((sum, item) => {
    if (item.status === "completed") return sum + 1;
    if (item.status === "in_progress") return sum + 0.5;
    if (item.status === "ready") return sum + 0.25;
    return sum;
  }, 0);

  return Math.round((score / items.length) * 100);
}

function getProgramExecutionState(
  items: ExecutionTrackerItem[]
): "idle" | "active" | "at_risk" | "completed" {
  if (!items.length) return "idle";

  const completedCount = items.filter(
    (item) => item.status === "completed"
  ).length;

  const inProgressCount = items.filter(
    (item) => item.status === "in_progress"
  ).length;

  const readyCount = items.filter(
    (item) => item.status === "ready"
  ).length;

  if (completedCount === items.length) {
    return "completed";
  }

  if (inProgressCount > 0 || readyCount > 0) {
    return "active";
  }

  return "idle";
}

function inferInitialExecutionStatus(
  index: number,
  total: number,
  phase: string
): ExecutionActionStatus {
  const normalizedPhase = phase.toLowerCase();

  if (total === 0) {
    return "pending";
  }

  if (normalizedPhase === "containment") {
    if (index === 0) return "in_progress";
    if (index === 1) return "ready";
    return "pending";
  }

  if (normalizedPhase === "stabilization") {
    if (index === 0) return "ready";
    return "pending";
  }

  if (normalizedPhase === "control") {
    if (index === 0) return "ready";
    return "pending";
  }

  return "pending";
}

function getLocalValidationIssues(metadata: MetadataState): string[] {
  const issues: string[] = [];
  const subsectors = SUBSECTOR_OPTIONS[metadata.sector] ?? [];
  const countries = Object.keys(COUNTRY_OPTIONS);
  const availableCities = COUNTRY_OPTIONS[metadata.country]?.cities ?? [];

  if (!metadata.sector.trim()) {
    issues.push("sector is required.");
  }

  if (!metadata.subsector.trim()) {
    issues.push("subsector is required.");
  } else if (!subsectors.includes(metadata.subsector)) {
    issues.push(
      `subsector "${metadata.subsector}" is not valid for sector "${metadata.sector}".`
    );
  }

  if (!metadata.country.trim()) {
    issues.push("country is required.");
  } else if (!countries.includes(metadata.country)) {
    issues.push(
      `country "${metadata.country}" is not part of the supported set.`
    );
  }

  if (!metadata.city.trim()) {
    issues.push("city is required.");
  } else if (!availableCities.includes(metadata.city)) {
    issues.push(
      `city "${metadata.city}" is not valid for country "${metadata.country}".`
    );
  }

  if (!metadata.business_name.trim()) {
    issues.push("business name is required.");
  }

  return issues;
}

function renderScaleLabel(value?: number): string {
  if (!value) return "not_selected";
  if (value <= 1) return "very_low";
  if (value === 2) return "low";
  if (value === 3) return "moderate";
  if (value === 4) return "high";
  return "very_high";
}

function findFirstPendingQuestionIndex(
  questions: CrcpQuestion[],
  metadata: MetadataState,
  answers: AnswerMap
): number {
  const pendingIndex = questions.findIndex(
    (question) => !isAnswered(getQuestionValue(question, metadata, answers))
  );

  return pendingIndex >= 0 ? pendingIndex : 0;
}

function getDomainStat(
  protocolDomainStats: DomainStat[],
  domain: string
): DomainStat | undefined {
  return protocolDomainStats.find((item) => item.domain === domain);
}

function formatResultScore(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "n/a";
  }

  return value.toFixed(2);
}

function clampPercent(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function prettyLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatAnswerValue(value: CrcpAnswerValue | undefined): string {
  if (value === undefined) return "not_answered";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value.trim() || "not_answered";
  if (Array.isArray(value))
    return value.length > 0 ? value.join(", ") : "not_answered";
  return "not_answered";
}

function formatUnknownValue(value: unknown): string {
  if (value === null || value === undefined) return "n/a";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  return JSON.stringify(value);
}

function getCaptureSummary(
  questions: CrcpQuestion[],
  metadata: MetadataState,
  answers: AnswerMap
): CaptureSummaryItem[] {
  const prioritizedIds = [
    "ID_01",
    "ID_02",
    "ID_06",
    "ID_07",
    "ID_08",
    "OPS_01",
    "OPS_02",
    "FIN_02",
    "REP_02",
    "PLN_04",
  ];

  return prioritizedIds
    .map((questionId) =>
      questions.find((question) => question.question_id === questionId)
    )
    .filter((question): question is CrcpQuestion => Boolean(question))
    .map((question) => ({
      label: question.text,
      value: formatAnswerValue(getQuestionValue(question, metadata, answers)),
    }));
}

function getHeaderSnapshot(metadata: MetadataState): HeaderSnapshotItem[] {
  return [
    {
      label: "Organization",
      value: metadata.business_name,
    },
    {
      label: "Sector",
      value: prettyLabel(metadata.sector),
    },
    {
      label: "Subsector",
      value: prettyLabel(metadata.subsector),
    },
    {
      label: "Country",
      value: COUNTRY_OPTIONS[metadata.country]?.label || metadata.country,
    },
    {
      label: "City",
      value: metadata.city,
    },
  ];
}

function getScoreBars(
  result: NonNullable<CrcpRunApiResponse["result"]>
): ScoreBarItem[] {
  if (!result.scores) return [];

  return [
    {
      label: "Operational Maturity",
      value: clampPercent(result.scores.operational_maturity),
    },
    {
      label: "Financial Pressure",
      value: clampPercent(result.scores.financial_pressure),
    },
    {
      label: "Reporting Reliability",
      value: clampPercent(result.scores.reporting_reliability),
    },
    {
      label: "Structural Risk",
      value: clampPercent(result.scores.structural_risk),
    },
    {
      label: "Commercial Strength",
      value: clampPercent(result.scores.commercial_strength),
    },
  ];
}

function getTwinVectorBars(twinSeedV2: TwinSeedV2): ScoreBarItem[] {
  return [
    {
      label: "Execution",
      value: clampPercent(twinSeedV2.structural_vector.execution),
    },
    {
      label: "Visibility",
      value: clampPercent(twinSeedV2.structural_vector.visibility),
    },
    {
      label: "Finance",
      value: clampPercent(twinSeedV2.structural_vector.finance),
    },
    {
      label: "Commercial",
      value: clampPercent(twinSeedV2.structural_vector.commercial),
    },
    {
      label: "Coordination",
      value: clampPercent(twinSeedV2.structural_vector.coordination),
    },
  ];
}

function buildExecutionTrackerItems(
  crcpProgram:
    | NonNullable<
        NonNullable<CrcpRunApiResponse["result"]>["crcp_program"]
      >
    | null
): ExecutionTrackerItem[] {
  if (!crcpProgram || !Array.isArray(crcpProgram.actions)) {
    return [];
  }

  return crcpProgram.actions.map((action, index, arr) => ({
    action_id: action.action_id,
    title: action.title,
    domain: action.domain,
    owner_role: action.owner_role,
    phase: action.phase,
    expected_outcome: action.expected_outcome,
    status: inferInitialExecutionStatus(
      index,
      arr.length,
      crcpProgram.current_phase
    ),
  }));
}

function getNextExecutionStatus(
  current: ExecutionActionStatus
): ExecutionActionStatus {
  if (current === "pending") return "ready";
  if (current === "ready") return "in_progress";
  if (current === "in_progress") return "completed";
  return "pending";
}

export default function CrcpLabPage() {
  const [orgSeed, setOrgSeed] = useState("");
  const [metadata, setMetadata] = useState<MetadataState>(INITIAL_METADATA);
  const [answers, setAnswers] = useState<AnswerMap>(INITIAL_ANSWER_MAP);
  const [isHeaderLocked, setIsHeaderLocked] = useState(false);
  const [simulationProfile, setSimulationProfile] =
    useState<SimulationProfile>("average");

const [loading, setLoading] = useState(false);
const [response, setResponse] = useState<CrcpRunApiResponse | null>(null);
const [error, setError] = useState<string | null>(null);
const [selectedRepoNode, setSelectedRepoNode] =
  useState<SelectedRepoNode | null>(null);
const [executionTrackerState, setExecutionTrackerState] = useState<
  ExecutionTrackerItem[]
>([]);

const [expandedRepoNodes, setExpandedRepoNodes] = useState<Record<string, boolean>>({
  repo_root: true,
  root_folder: true,
  domains_folder: true,
  roles_folder: true,
  evidence_folder: false,
  execution_folder: true,
  automation_folder: false,
  finance_folder: false,
  commercial_folder: false,
  activation_folder: false,
  simulation_folder: false,
  lineage_folder: false,
  governance_folder: false,
});

const [repoPriorityFilter, setRepoPriorityFilter] = useState<
  "all" | "critical" | "program_linked" | "uncovered" | "evidence_poor"
>("all");

  const [questionCatalog, setQuestionCatalog] =
    useState<CrcpQuestionsApiResponse["result"]>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
  setOrgSeed(Math.random().toString(36).slice(2, 7));
}, []);

  const organizationId = useMemo(() => {
    if (!orgSeed) {
      return "";
    }

    return buildOrganizationId(
      metadata.business_name,
      metadata.sector,
      orgSeed
    );
  }, [orgSeed, metadata.business_name, metadata.sector]);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      try {
        setQuestionsLoading(true);
        setQuestionsError(null);

        const res = await fetch(
          `/api/internal/crcp/questions?sector=${encodeURIComponent(
            metadata.sector
          )}`,
          { cache: "no-store" }
        );

        const data = (await res.json()) as CrcpQuestionsApiResponse;

        if (cancelled) {
          return;
        }

        if (!res.ok || !data.ok || !data.result) {
          setQuestionCatalog(null);
          setQuestionsError(
            data.error || `Questions request failed: ${res.status}`
          );
          return;
        }

        setQuestionCatalog(data.result);
        setResponse(null);
        setError(null);
        setAnswers({});
        setCurrentQuestionIndex(0);
      } catch (err) {
        if (!cancelled) {
          setQuestionCatalog(null);
          setQuestionsError(
            err instanceof Error ? err.message : "Unknown questions error"
          );
        }
      } finally {
        if (!cancelled) {
          setQuestionsLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [metadata.sector]);

  const allQuestions = useMemo(() => {
    if (!questionCatalog) {
      return [];
    }

    return [
      ...questionCatalog.identityQuestions,
      ...questionCatalog.adaptiveQuestions,
    ];
  }, [questionCatalog]);

  useEffect(() => {
    if (allQuestions.length === 0) {
      setCurrentQuestionIndex(0);
      return;
    }

    setCurrentQuestionIndex((prev) => {
      if (prev >= allQuestions.length) {
        return Math.max(allQuestions.length - 1, 0);
      }
      return prev;
    });
  }, [allQuestions]);

  const availableSubsectors = useMemo(
    () => SUBSECTOR_OPTIONS[metadata.sector] ?? [],
    [metadata.sector]
  );

  const availableCities = useMemo(
    () => COUNTRY_OPTIONS[metadata.country]?.cities ?? [],
    [metadata.country]
  );

  const localValidationIssues = useMemo(
    () => getLocalValidationIssues(metadata),
    [metadata]
  );

  const answeredCount = useMemo(() => {
    return allQuestions.filter((question) =>
      isAnswered(getQuestionValue(question, metadata, answers))
    ).length;
  }, [allQuestions, metadata, answers]);

  const totalQuestionCount = allQuestions.length;
  const remainingCount = Math.max(totalQuestionCount - answeredCount, 0);
  const progressPercent =
    totalQuestionCount > 0
      ? Number(((answeredCount / totalQuestionCount) * 100).toFixed(1))
      : 0;

  const currentQuestion = allQuestions[currentQuestionIndex] ?? null;
  const currentQuestionValue = currentQuestion
    ? getQuestionValue(currentQuestion, metadata, answers)
    : undefined;

  const protocolDomainStats = useMemo<DomainStat[]>(() => {
    const buckets = new Map<string, { total: number; answered: number }>();

    for (const question of allQuestions) {
      const existing = buckets.get(question.domain) ?? {
        total: 0,
        answered: 0,
      };

      existing.total += 1;

      if (isAnswered(getQuestionValue(question, metadata, answers))) {
        existing.answered += 1;
      }

      buckets.set(question.domain, existing);
    }

    return Array.from(buckets.entries()).map(([domain, stats]) => ({
      domain,
      total: stats.total,
      answered: stats.answered,
      percent:
        stats.total > 0
          ? Number(((stats.answered / stats.total) * 100).toFixed(0))
          : 0,
      state:
        stats.answered === 0
          ? "pending"
          : stats.answered === stats.total
          ? "complete"
          : "in_progress",
    }));
  }, [allQuestions, metadata, answers]);

  const identityStat = getDomainStat(protocolDomainStats, "identity");
const operationsStat = getDomainStat(protocolDomainStats, "operations");
const reportingStat = getDomainStat(protocolDomainStats, "reporting");
const financeStat = getDomainStat(protocolDomainStats, "finance");

const captureSummary = useMemo(
  () => getCaptureSummary(allQuestions, metadata, answers),
  [allQuestions, metadata, answers]
);

const headerSnapshot = useMemo(() => getHeaderSnapshot(metadata), [metadata]);

// ===============================
// CORE RESULT
// ===============================
const result = response?.result ?? null;

// ===============================
// CRCP PROGRAM (BLOCK H BASE)
// ===============================
const crcpProgram = result?.crcp_program ?? null;

useEffect(() => {
  setExecutionTrackerState(buildExecutionTrackerItems(crcpProgram));
}, [crcpProgram]);

const executionTrackerItems = executionTrackerState;

const executionProgressPercent = useMemo(
  () => getExecutionProgressPercent(executionTrackerItems),
  [executionTrackerItems]
);

const programExecutionState = useMemo(
  () => getProgramExecutionState(executionTrackerItems), 
  [executionTrackerItems]
);

// ===============================
// VALIDATION + SCORES
// ===============================
const backendValidationIssues = result?.validation_issues ?? [];

const scoreBars = useMemo(
  () => (result ? getScoreBars(result) : []),
  [result]
);

// ===============================
// TWIN
// ===============================
const twinSeedV2 = result?.twin_seed_v2 ?? null;
const twinStructure = result?.twin_structure ?? null;

const twinVectorBars = useMemo(
  () => (twinSeedV2 ? getTwinVectorBars(twinSeedV2) : []),
  [twinSeedV2]
);

const selectedDomainNode = useMemo(() => {
  if (!twinStructure || !selectedRepoNode || selectedRepoNode.node_type !== "domain") {
    return null;
  }

  return (
    twinStructure.domains.find(
      (domain) => domain.domain_id === selectedRepoNode.node_id
    ) || null
  );
}, [twinStructure, selectedRepoNode]);

const selectedRoleNode = useMemo(() => {
  if (!twinStructure || !selectedRepoNode || selectedRepoNode.node_type !== "role") {
    return null;
  }

  return (
    twinStructure.roles.find((role) => role.role_id === selectedRepoNode.node_id) ||
    null
  );
}, [twinStructure, selectedRepoNode]);

const selectedRepoNodeStatus = useMemo(() => {
  if (!selectedRepoNode || !twinStructure) {
    return "n/a";
  }

  if (selectedRepoNode.node_type === "root") {
    return twinStructure.root.state_label;
  }

  if (selectedRepoNode.node_type === "domain" && selectedDomainNode) {
    return selectedDomainNode.status;
  }

  if (selectedRepoNode.node_type === "role" && selectedRoleNode) {
    return selectedRoleNode.status;
  }

  if (selectedRepoNode.node_type === "evidence") {
    return twinStructure.evidence.length > 0 ? "active" : "pending";
  }

  if (selectedRepoNode.node_type === "execution") {
    return programExecutionState;
  }

  if (selectedRepoNode.node_type === "automation") {
    return "planned";
  }

  if (selectedRepoNode.node_type === "commercial") {
    const commercialDomain = twinStructure.domains.find(
      (domain) => domain.domain_name === "commercial"
    );
    return commercialDomain?.status || "planned";
  }

  if (selectedRepoNode.node_type === "activation") {
    return twinStructure.activation.activation_status;
  }

  if (selectedRepoNode.node_type === "simulation") {
    return twinStructure.simulation?.simulation_status || "planned";
  }

  if (selectedRepoNode.node_type === "lineage") {
    return "traceable";
  }

  if (selectedRepoNode.node_type === "governance") {
    const governanceDomain = twinStructure.domains.find(
      (domain) => domain.domain_name === "governance"
    );
    return governanceDomain?.status || "planned";
  }

  return "n/a";
}, [
  selectedRepoNode,
  twinStructure,
  selectedDomainNode,
  selectedRoleNode,
  programExecutionState,
]);

const selectedRepoNodeScore = useMemo(() => {
  if (!selectedRepoNode || !twinStructure) {
    return "n/a";
  }

  if (selectedRepoNode.node_type === "root") {
    return result?.scores
      ? `${formatResultScore(result.scores.operational_maturity)} / 100`
      : "n/a";
  }

  if (selectedRepoNode.node_type === "domain" && selectedDomainNode) {
    return typeof selectedDomainNode.score === "number"
      ? `${selectedDomainNode.score.toFixed(2)} / 100`
      : "n/a";
  }

  if (selectedRepoNode.node_type === "role") {
    return "role-based";
  }

  if (selectedRepoNode.node_type === "execution") {
    return `${executionProgressPercent}%`;
  }

  return "n/a";
}, [
  selectedRepoNode,
  twinStructure,
  selectedDomainNode,
  result,
  executionProgressPercent,
]);

const selectedRepoNodeEvidenceCount = useMemo(() => {
  if (!selectedRepoNode || !twinStructure) {
    return 0;
  }

  if (selectedRepoNode.node_type === "root") {
    return twinStructure.evidence.length;
  }

  if (selectedRepoNode.node_type === "domain") {
    return twinStructure.evidence.filter(
      (item) => item.linked_domain_id === selectedRepoNode.node_id
    ).length;
  }

  if (selectedRepoNode.node_type === "role") {
    return twinStructure.evidence.filter(
      (item) => item.linked_role_id === selectedRepoNode.node_id
    ).length;
  }

  if (selectedRepoNode.node_type === "evidence") {
    return twinStructure.evidence.length;
  }

  return 0;
}, [selectedRepoNode, twinStructure]);

const financeDomainNode = useMemo(() => {
  if (!twinStructure) return null;

  return (
    twinStructure.domains.find((domain) => domain.domain_name === "finance") || null
  );
}, [twinStructure]);

const financeRoleNode = useMemo(() => {
  if (!twinStructure) return null;

  return (
    twinStructure.roles.find((role) =>
      role.role_name.toLowerCase().includes("finance")
    ) || null
  );
}, [twinStructure]);

const financeEvidenceCount = useMemo(() => {
  if (!twinStructure || !financeDomainNode) return 0;

  return twinStructure.evidence.filter(
    (item) => item.linked_domain_id === financeDomainNode.domain_id
  ).length;
}, [twinStructure, financeDomainNode]);

const criticalFocusDomain = useMemo(() => {
  if (!twinStructure || twinStructure.domains.length === 0) {
    return null;
  }

  const scoredDomains = twinStructure.domains.filter(
    (domain) => typeof domain.score === "number"
  );

  if (scoredDomains.length === 0) {
    return null;
  }

  return scoredDomains.reduce((lowest, current) => {
    const lowestScore = typeof lowest.score === "number" ? lowest.score : Infinity;
    const currentScore = typeof current.score === "number" ? current.score : Infinity;
    return currentScore < lowestScore ? current : lowest;
  });
}, [twinStructure]);

useEffect(() => {
  if (!twinStructure) {
    return;
  }

  setSelectedRepoNode((prev) => {
    if (prev) {
      return prev;
    }

    if (criticalFocusDomain) {
      return {
        node_type: "domain",
        node_id: criticalFocusDomain.domain_id,
        node_label: criticalFocusDomain.domain_label,
      };
    }

    return {
      node_type: "root",
      node_id: twinStructure.root.entity_id,
      node_label: twinStructure.root.display_name,
    };
  });
}, [twinStructure, criticalFocusDomain]);

const selectedNodeDependencies = useMemo(() => {
  if (!selectedRepoNode || !twinStructure) {
    return [];
  }

  return twinStructure.dependencies.filter(
    (edge) =>
      edge.from_node_id === selectedRepoNode.node_id ||
      edge.to_node_id === selectedRepoNode.node_id
  );
}, [selectedRepoNode, twinStructure]);

const selectedNodeEvidencePreview = useMemo(() => {
  if (!selectedRepoNode || !twinStructure) {
    return [];
  }

  if (selectedRepoNode.node_type === "root") {
    return twinStructure.evidence.slice(0, 5);
  }

  if (selectedRepoNode.node_type === "domain") {
    return twinStructure.evidence
      .filter((item) => item.linked_domain_id === selectedRepoNode.node_id)
      .slice(0, 5);
  }

  if (selectedRepoNode.node_type === "role") {
    return twinStructure.evidence
      .filter((item) => item.linked_role_id === selectedRepoNode.node_id)
      .slice(0, 5);
  }

  if (selectedRepoNode.node_type === "evidence") {
    return twinStructure.evidence.slice(0, 5);
  }

  return [];
}, [selectedRepoNode, twinStructure]);

const selectedNodeExecutionActions = useMemo(() => {
  if (!selectedRepoNode || !crcpProgram) {
    return [];
  }

  if (selectedRepoNode.node_type === "domain") {
    const domainName =
      twinStructure?.domains.find(
        (domain) => domain.domain_id === selectedRepoNode.node_id
      )?.domain_name || "";

    return crcpProgram.actions.filter((action) => action.domain === domainName);
  }

  if (selectedRepoNode.node_type === "role") {
    const roleName =
      twinStructure?.roles.find((role) => role.role_id === selectedRepoNode.node_id)
        ?.role_name || "";

    return crcpProgram.actions.filter((action) => action.owner_role === roleName);
  }

  if (selectedRepoNode.node_type === "execution") {
    return crcpProgram.actions;
  }

  return [];
}, [selectedRepoNode, crcpProgram, twinStructure]);

const selectedNodeExecutionLinked = useMemo(() => {
  if (!selectedRepoNode || !crcpProgram) {
    return false;
  }

  if (selectedRepoNode.node_type === "execution") {
    return true;
  }

  if (selectedRepoNode.node_type === "domain") {
    const domainName =
      twinStructure?.domains.find(
        (domain) => domain.domain_id === selectedRepoNode.node_id
      )?.domain_name || "";

    return (
      crcpProgram.target_domains.includes(domainName) ||
      crcpProgram.actions.some((action) => action.domain === domainName)
    );
  }

  if (selectedRepoNode.node_type === "role") {
    const roleName =
      twinStructure?.roles.find(
        (role) => role.role_id === selectedRepoNode.node_id
      )?.role_name || "";

    return crcpProgram.actions.some((action) => action.owner_role === roleName);
  }

  return false;
}, [selectedRepoNode, crcpProgram, twinStructure]);

const selectedNodeInterpretation = useMemo(() => {
  return getSelectedNodeInterpretation({
    selectedRepoNode,
    selectedDomainNode,
    selectedRoleNode,
    selectedNodeExecutionLinked,
    selectedNodeExecutionActions,
  });
}, [
  selectedRepoNode,
  selectedDomainNode,
  selectedRoleNode,
  selectedNodeExecutionLinked,
  selectedNodeExecutionActions,
]);

const selectedNodeRiskBand = useMemo(() => {
  return getSelectedNodeRiskBand({
    selectedRepoNodeStatus,
    selectedRepoNodeExecutionLinked: selectedNodeExecutionLinked,
  });
}, [selectedRepoNodeStatus, selectedNodeExecutionLinked]);

const selectedNodeSystemType = useMemo(() => {
  return getSelectedNodeSystemType(selectedRepoNode);
}, [selectedRepoNode]);

const selectedNodeDirective = useMemo(() => {
  return getSelectedNodeDirective({
    selectedRepoNode,
    selectedNodeExecutionLinked,
    selectedNodeRiskBand,
    selectedNodeExecutionActions,
  });
}, [
  selectedRepoNode,
  selectedNodeExecutionLinked,
  selectedNodeRiskBand,
  selectedNodeExecutionActions,
]);

const selectedNodeForecast = useMemo(() => {
  if (!selectedRepoNode) {
    return {
      ifIgnored: "No node selected.",
      ifStabilized: "No stabilization path available.",
      propagation: "No propagation reading available.",
      recommendation: "Select a structural node to generate forecast.",
    };
  }

  const downstreamCount = selectedNodeDependencies.filter(
    (edge) => edge.from_node_id === selectedRepoNode.node_id
  ).length;

  const upstreamCount = selectedNodeDependencies.filter(
    (edge) => edge.to_node_id === selectedRepoNode.node_id
  ).length;

  const totalExposure = downstreamCount + upstreamCount;

  const status = String(selectedRepoNodeStatus || "").toLowerCase();

  const ignoredMessage =
    status === "critical" || status === "fragile" || status === "degraded"
      ? `Structural instability may continue propagating across ${totalExposure} connected relation(s).`
      : totalExposure > 0
      ? `This node may remain a latent weak point across ${totalExposure} connected relation(s).`
      : "Limited visible propagation if ignored.";

  const stabilizedMessage = selectedNodeExecutionLinked
    ? "Active intervention coverage can improve structural coherence and reduce local pressure."
    : "Stabilization would reduce exposure and improve route eligibility for execution.";

  const propagationMessage =
    downstreamCount > 0
      ? `${downstreamCount} downstream relation(s) may be influenced by this node.`
      : "No direct downstream propagation detected.";

  const recommendationMessage = selectedNodeExecutionLinked
    ? "Execute current linked action and re-evaluate downstream effects."
    : selectedNodeRiskBand === "critical"
    ? "Escalate node into execution path or assign explicit containment logic."
    : "Monitor evidence growth and determine whether execution routing is justified.";

  return {
    ifIgnored: ignoredMessage,
    ifStabilized: stabilizedMessage,
    propagation: propagationMessage,
    recommendation: recommendationMessage,
  };
}, [
  selectedRepoNode,
  selectedNodeDependencies,
  selectedRepoNodeStatus,
  selectedNodeExecutionLinked,
  selectedNodeRiskBand,
]);

const selectedNodeSequence = useMemo(() => {
  const currentAction =
    selectedNodeExecutionActions.length > 0
      ? selectedNodeExecutionActions[0].title
      : "No active action";

  const nextAction =
    selectedNodeExecutionActions.length > 1
      ? selectedNodeExecutionActions[1].title
      : selectedNodeExecutionLinked
      ? "No second queued action"
      : "Node not yet routed";

  const nextStructuralTarget = selectedNodeDependencies.find(
    (edge) => edge.from_node_id === selectedRepoNode?.node_id
  )?.to_node_id || "No downstream target";

  const executionRoute = selectedNodeExecutionLinked
    ? "Node is inside active CRCP route"
    : "Node remains outside active CRCP route";

  return {
    currentAction,
    nextAction,
    nextStructuralTarget,
    executionRoute,
  };
}, [
  selectedRepoNode,
  selectedNodeDependencies,
  selectedNodeExecutionActions,
  selectedNodeExecutionLinked,
]);

const selectedNodePrioritySignal = useMemo(() => {
  return getSelectedNodePrioritySignal({
    selectedRepoNode,
    selectedNodeExecutionLinked,
    selectedNodeRiskBand,
    selectedNodeDependenciesCount: selectedNodeDependencies.length,
    selectedNodeExecutionActionsCount: selectedNodeExecutionActions.length,
  });
}, [
  selectedRepoNode,
  selectedNodeExecutionLinked,
  selectedNodeRiskBand,
  selectedNodeDependencies.length,
  selectedNodeExecutionActions.length,
]);

function getRepoNodeStatus(node: RepoTreeNode): string {
  if (node.node_type === "root") {
    return twinStructure?.root.state_label || "planned";
  }

  if (node.node_type === "domain") {
    const domain = twinStructure?.domains.find((d) => d.domain_id === node.id);
    return domain?.status || "planned";
  }

  if (node.node_type === "role") {
    const role = twinStructure?.roles.find((r) => r.role_id === node.id);
    return role?.status || "planned";
  }

  if (node.node_type === "execution") {
    return programExecutionState;
  }

  if (node.node_type === "evidence") {
    return twinStructure?.evidence.length ? "active" : "pending";
  }

  if (node.node_type === "activation") {
    return twinStructure?.activation.activation_status || "planned";
  }

  if (node.node_type === "simulation") {
    return twinStructure?.simulation?.simulation_status || "planned";
  }

  if (node.node_type === "commercial") {
    const commercialDomain = twinStructure?.domains.find(
      (domain) => domain.domain_name === "commercial"
    );
    return commercialDomain?.status || "planned";
  }

  if (node.node_type === "governance") {
    const governanceDomain = twinStructure?.domains.find(
      (domain) => domain.domain_name === "governance"
    );
    return governanceDomain?.status || "planned";
  }

  return node.status || "planned";
}

function getRepoNodeTone(status?: string): CSSProperties {
  const value = String(status || "").toLowerCase();

  if (
    value === "critical" ||
    value === "fragile" ||
    value === "degraded"
  ) {
    return {
      color: "#fca5a5",
      borderLeft: "2px solid #ef4444",
      paddingLeft: 6,
    };
  }

  if (
    value === "pending" ||
    value === "planned" ||
    value === "medium" ||
    value === "elevated"
  ) {
    return {
      color: "#fcd34d",
      borderLeft: "2px solid #f59e0b",
      paddingLeft: 6,
    };
  }

  return {
    color: "#86efac",
    borderLeft: "2px solid #22c55e",
    paddingLeft: 6,
  };
}

function toggleRepoNode(nodeId: string) {
  setExpandedRepoNodes((prev) => ({
    ...prev,
    [nodeId]: !prev[nodeId],
  }));
}

const repoTree = useMemo<RepoTreeNode | null>(() => {
  if (!twinStructure) return null;

  return {
    id: "repo_root",
    label: `/${slugify(twinStructure.root.display_name || "company")}__${slugify(
  twinStructure.root.sector || "general"
)}__runtime_root`,
    node_type: "folder",
    selectable: false,
    children: [
      {
        id: "root_folder",
        label: "root/",
        node_type: "folder",
        selectable: false,
        children: [
          {
            id: twinStructure.root.entity_id,
            label: "entity_id.ts",
            node_type: "root",
            selectable: true,
          },
          { id: "legal_identity_file", label: "legal_identity.ts", node_type: "file", selectable: false },
          { id: "business_identity_file", label: "business_identity.ts", node_type: "file", selectable: false },
          { id: "sector_profile_file", label: "sector_profile.ts", node_type: "file", selectable: false },
          { id: "subsector_profile_file", label: "subsector_profile.ts", node_type: "file", selectable: false },
          { id: "operational_identity_file", label: "operational_identity.ts", node_type: "file", selectable: false },
          { id: "lifecycle_file", label: "lifecycle.ts", node_type: "file", selectable: false },
        ],
      },
      {
        id: "domains_folder",
        label: "domains/",
        node_type: "folder",
        selectable: false,
        children: twinStructure.domains.map((domain) => ({
          id: domain.domain_id,
          label: `${slugify(domain.domain_name)}.domain.ts`,
          node_type: "domain",
          selectable: true,
        })),
      },
      {
        id: "roles_folder",
        label: "roles/",
        node_type: "folder",
        selectable: false,
        children: twinStructure.roles.map((role) => ({
          id: role.role_id,
          label: `${slugify(role.role_name)}.role.ts`,
          node_type: "role",
          selectable: true,
        })),
      },
      {
        id: "evidence_folder",
        label: "evidence/",
        node_type: "folder",
        selectable: false,
        children: [
          { id: "evidence_layer", label: "evidence.index.ts", node_type: "evidence", selectable: true },
          { id: "signal_registry_file", label: "signal_registry.ts", node_type: "file", selectable: false },
          { id: "constraint_registry_file", label: "constraint_registry.ts", node_type: "file", selectable: false },
        ],
      },
      {
        id: "execution_folder",
        label: "execution/",
        node_type: "folder",
        selectable: false,
        children: [
          { id: "execution_layer", label: "crcp_program.ts", node_type: "execution", selectable: true },
          { id: "execution_tracker_file", label: "execution_tracker.ts", node_type: "file", selectable: false },
          { id: "execution_state_file", label: "execution_state.ts", node_type: "file", selectable: false },
          { id: "dependency_map_file", label: "dependency_map.ts", node_type: "file", selectable: false },
        ],
      },
      {
        id: "automation_folder",
        label: "automation/",
        node_type: "folder",
        selectable: false,
        children: [
          { id: "automation_layer", label: "phase_01_stabilization.ts", node_type: "automation", selectable: true },
          { id: "phase_02_control_file", label: "phase_02_control.ts", node_type: "file", selectable: false },
          { id: "phase_03_optimization_file", label: "phase_03_optimization.ts", node_type: "file", selectable: false },
          { id: "automation_policy_file", label: "automation_policy.ts", node_type: "file", selectable: false },
        ],
      },
      {
        id: "finance_folder",
        label: "finance/",
        node_type: "folder",
        selectable: false,
        children: [
          {
            id: financeDomainNode?.domain_id || "finance_domain_virtual",
            label: "finance.domain.ts",
            node_type: "domain",
            selectable: Boolean(financeDomainNode),
          },
          { id: "cashflow_control_file", label: "cashflow_control.ts", node_type: "file", selectable: false },
          { id: "margin_visibility_file", label: "margin_visibility.ts", node_type: "file", selectable: false },
          { id: "expense_pressure_file", label: "expense_pressure.ts", node_type: "file", selectable: false },
          { id: "financial_risk_flags_file", label: "financial_risk_flags.ts", node_type: "file", selectable: false },
        ],
      },
      {
        id: "commercial_folder",
        label: "commercial/",
        node_type: "folder",
        selectable: false,
        children: [
          { id: "commercial_layer", label: "channel_architecture.ts", node_type: "commercial", selectable: true },
          { id: "social_media_system_file", label: "social_media_system.ts", node_type: "file", selectable: false },
          { id: "campaign_logic_file", label: "campaign_logic.ts", node_type: "file", selectable: false },
          { id: "demand_generation_file", label: "demand_generation.ts", node_type: "file", selectable: false },
        ],
      },
      {
        id: "activation_folder",
        label: "activation/",
        node_type: "folder",
        selectable: false,
        children: [
          { id: "activation_layer", label: "activation.layer.ts", node_type: "activation", selectable: true },
          { id: "activation_path_file", label: "activation_path.ts", node_type: "file", selectable: false },
          { id: "readiness_gate_file", label: "readiness_gate.ts", node_type: "file", selectable: false },
        ],
      },
      {
        id: "simulation_folder",
        label: "simulation/",
        node_type: "folder",
        selectable: false,
        children: [
          { id: "simulation_layer", label: "simulation.layer.ts", node_type: "simulation", selectable: true },
          { id: "scenario_registry_file", label: "scenario_registry.ts", node_type: "file", selectable: false },
          { id: "scenario_execution_file", label: "scenario_execution.ts", node_type: "file", selectable: false },
        ],
      },
      {
        id: "lineage_folder",
        label: "lineage/",
        node_type: "folder",
        selectable: false,
        children: [
          { id: "lineage_layer", label: "lineage_id.ts", node_type: "lineage", selectable: true },
          { id: "twin_history_file", label: "twin_history.ts", node_type: "file", selectable: false },
          { id: "structural_transitions_file", label: "structural_transitions.ts", node_type: "file", selectable: false },
        ],
      },
      {
        id: "governance_folder",
        label: "governance/",
        node_type: "folder",
        selectable: false,
        children: [
          { id: "governance_layer", label: "governance_state.ts", node_type: "governance", selectable: true },
          { id: "operating_rules_file", label: "operating_rules.ts", node_type: "file", selectable: false },
          { id: "control_surface_file", label: "control_surface.ts", node_type: "file", selectable: false },
        ],
      },
    ],
  };
}, [twinStructure, financeDomainNode]);

function renderRepoTreeNode(node: RepoTreeNode, depth = 0): ReactNode {
  const isFolder = node.node_type === "folder";
  const isExpanded = expandedRepoNodes[node.id] ?? false;
  const isSelected = selectedRepoNode?.node_id === node.id;
  const nodeStatus = getRepoNodeStatus(node);
  const toneStyle = getRepoNodeTone(nodeStatus);
    const nodeMarkers = getRepoNodeMarkers(node, twinStructure, crcpProgram);

  const indent = `${depth * 18}px`;

    if (
    !shouldShowRepoNode(
      node,
      repoPriorityFilter,
      twinStructure,
      crcpProgram
    )
  ) {
    return null;
  }

  return (
    <div key={node.id} style={{ display: "grid", gap: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginLeft: indent,
          ...toneStyle,
        }}
      >
        {isFolder ? (
          <button
            type="button"
            onClick={() => toggleRepoNode(node.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 12,
              width: 18,
            }}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        ) : (
          <div style={{ width: 18 }} />
        )}

                <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
          <button
            type="button"
            onClick={() => {
              if (!node.selectable) return;
              if (node.node_type === "file" || node.node_type === "folder") return;

              setSelectedRepoNode({
                node_type: node.node_type as RepoNodeType,
                node_id: node.id,
                node_label: node.label,
              });
            }}
            style={{
              background: isSelected ? "#1e293b" : "transparent",
              border: isSelected ? "1px solid #3b82f6" : "1px solid transparent",
              color: toneStyle.color || "#cbd5e1",
              textAlign: "left",
              padding: "3px 8px",
              cursor: node.selectable ? "pointer" : "default",
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: 13,
              borderRadius: 6,
              width: "100%",
              opacity: node.selectable ? 1 : 0.82,
            }}
          >
            {node.label}
          </button>

          {node.selectable ? (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {nodeMarkers.isCritical ? (
                <span className={toneClass("critical")} style={{ fontSize: 10, padding: "2px 6px" }}>
                  C
                </span>
              ) : null}

              {nodeMarkers.isProgramLinked ? (
                <span className={toneClass("active")} style={{ fontSize: 10, padding: "2px 6px" }}>
                  P
                </span>
              ) : null}

              {nodeMarkers.isEvidencePoor ? (
                <span className={toneClass("pending")} style={{ fontSize: 10, padding: "2px 6px" }}>
                  E
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {isFolder && isExpanded && node.children?.length
        ? node.children.map((child) => renderRepoTreeNode(child, depth + 1))
        : null}
    </div>
  );
}

function getRepoNodeEvidenceCount(
  node: RepoTreeNode,
  twinStructure: TwinStructure | null
): number {
  if (!twinStructure) return 0;

  if (node.node_type === "root") {
    return twinStructure.evidence.length;
  }

  if (node.node_type === "domain") {
    return twinStructure.evidence.filter(
      (item) => item.linked_domain_id === node.id
    ).length;
  }

  if (node.node_type === "role") {
    return twinStructure.evidence.filter(
      (item) => item.linked_role_id === node.id
    ).length;
  }

  if (node.node_type === "evidence") {
    return twinStructure.evidence.length;
  }

  return 0;
}

function isRepoNodeProgramLinked(
  node: RepoTreeNode,
  twinStructure: TwinStructure | null,
  crcpProgram: CrcpProgram | null
): boolean {
  if (!crcpProgram) return false;

  if (node.node_type === "execution") {
    return true;
  }

  if (node.node_type === "domain") {
    const domainName =
      twinStructure?.domains.find((domain) => domain.domain_id === node.id)
        ?.domain_name || "";

    return (
      crcpProgram.target_domains.includes(domainName) ||
      crcpProgram.actions.some((action) => action.domain === domainName)
    );
  }

  if (node.node_type === "role") {
    const roleName =
      twinStructure?.roles.find((role) => role.role_id === node.id)?.role_name ||
      "";

    return crcpProgram.actions.some((action) => action.owner_role === roleName);
  }

  return false;
}

function shouldShowRepoNode(
  node: RepoTreeNode,
  filter: "all" | "critical" | "program_linked" | "uncovered" | "evidence_poor",
  twinStructure: TwinStructure | null,
  crcpProgram: CrcpProgram | null
): boolean {
  if (node.node_type === "folder" || node.node_type === "file") {
    return true;
  }

  if (filter === "all") {
    return true;
  }

  const status = getRepoNodeStatusStatic(node, twinStructure, crcpProgram);
  const evidenceCount = getRepoNodeEvidenceCount(node, twinStructure);
  const programLinked = isRepoNodeProgramLinked(node, twinStructure, crcpProgram);

  if (filter === "critical") {
    return ["critical", "fragile", "degraded"].includes(status.toLowerCase());
  }

  if (filter === "program_linked") {
    return programLinked;
  }

  if (filter === "uncovered") {
    return !programLinked && node.selectable === true;
  }

  if (filter === "evidence_poor") {
    return node.selectable === true && evidenceCount <= 1;
  }

  return true;
}

function getRepoNodeStatusStatic(
  node: RepoTreeNode,
  twinStructure: TwinStructure | null,
  programExecutionState: CrcpProgram | null | string
): string {
  if (node.node_type === "root") {
    return twinStructure?.root.state_label || "planned";
  }

  if (node.node_type === "domain") {
    const domain = twinStructure?.domains.find((d) => d.domain_id === node.id);
    return domain?.status || "planned";
  }

  if (node.node_type === "role") {
    const role = twinStructure?.roles.find((r) => r.role_id === node.id);
    return role?.status || "planned";
  }

  if (node.node_type === "execution") {
    return typeof programExecutionState === "string"
      ? programExecutionState
      : "planned";
  }

  if (node.node_type === "evidence") {
    return twinStructure?.evidence.length ? "active" : "pending";
  }

  if (node.node_type === "activation") {
    return twinStructure?.activation.activation_status || "planned";
  }

  if (node.node_type === "simulation") {
    return twinStructure?.simulation?.simulation_status || "planned";
  }

  if (node.node_type === "commercial") {
    const commercialDomain = twinStructure?.domains.find(
      (domain) => domain.domain_name === "commercial"
    );
    return commercialDomain?.status || "planned";
  }

  if (node.node_type === "governance") {
    const governanceDomain = twinStructure?.domains.find(
      (domain) => domain.domain_name === "governance"
    );
    return governanceDomain?.status || "planned";
  }

  return node.status || "planned";
}

function getRepoNodeButtonStyle(isActive: boolean): CSSProperties {
  return {
    background: isActive ? "#1e293b" : "transparent",
    border: isActive ? "1px solid #3b82f6" : "1px solid transparent",
    color: isActive ? "#f8fafc" : "#cbd5e1",
    textAlign: "left",
    padding: "2px 6px",
    cursor: "pointer",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 13,
    borderRadius: 6,
  };
}

function getSelectedNodeInterpretation(input: {
  selectedRepoNode: SelectedRepoNode | null;
  selectedDomainNode: TwinDomainNode | null;
  selectedRoleNode: TwinRoleNode | null;
  selectedNodeExecutionLinked: boolean;
  selectedNodeExecutionActions: Array<{
    action_id: string;
    domain: string;
    title: string;
    description: string;
    owner_role: string;
    expected_outcome: string;
    phase: string;
  }>;
}): {
  summary: string;
  actionability: "high" | "medium" | "low";
  recommended_reading: string;
} {
  const {
    selectedRepoNode,
    selectedDomainNode,
    selectedRoleNode,
    selectedNodeExecutionLinked,
    selectedNodeExecutionActions,
  } = input;

  if (!selectedRepoNode) {
    return {
      summary: "No node selected.",
      actionability: "low",
      recommended_reading: "Select a repository node to inspect its structural meaning.",
    };
  }

  if (selectedRepoNode.node_type === "root") {
    return {
      summary:
        "This is the primary business root. It defines the entity that anchors all domains, roles, evidence, execution, and governance logic.",
      actionability: "medium",
      recommended_reading:
        "Use root inspection to confirm entity integrity, state quality, and total system cohesion.",
    };
  }

  if (selectedRepoNode.node_type === "domain" && selectedDomainNode) {
    return {
      summary:
        selectedDomainNode.summary ||
        "This domain concentrates structural logic, evidence, and role ownership for a critical business layer.",
      actionability:
        selectedNodeExecutionLinked || (selectedDomainNode.score ?? 100) < 60
          ? "high"
          : "medium",
      recommended_reading:
        selectedNodeExecutionLinked
          ? "This domain is program-linked. Review active actions and evidence before intervention."
          : "Review score, owner role, and structural evidence before defining action.",
    };
  }

  if (selectedRepoNode.node_type === "role" && selectedRoleNode) {
    return {
      summary:
        selectedRoleNode.responsibility_summary ||
        "This role acts as an operational responsibility anchor inside the twin.",
      actionability: selectedNodeExecutionLinked ? "high" : "medium",
      recommended_reading:
        selectedNodeExecutionLinked
          ? "This role is directly exposed to execution pressure."
          : "Use this role to understand ownership and accountability distribution.",
    };
  }

  if (selectedRepoNode.node_type === "execution") {
    return {
      summary:
        "This node represents the active operational program generated from the CRCP decision layer.",
      actionability: "high",
      recommended_reading:
        selectedNodeExecutionActions.length > 0
          ? "Execution is live. Review units, owners, and intended outcomes."
          : "No linked actions detected yet.",
    };
  }

  return {
    summary:
      "This node belongs to a structural support layer of the twin repository.",
    actionability: selectedNodeExecutionLinked ? "high" : "low",
    recommended_reading:
      selectedNodeExecutionLinked
        ? "This node is linked to current program execution."
        : "Use this node as a structural reading surface.",
  };
}

function getSelectedNodeRiskBand(input: {
  selectedRepoNodeStatus: string;
  selectedRepoNodeExecutionLinked: boolean;
}): "critical" | "elevated" | "stable" {
  const status = String(input.selectedRepoNodeStatus || "").toLowerCase();

  if (
    status === "critical" ||
    status === "fragile" ||
    status === "degraded"
  ) {
    return "critical";
  }

  if (input.selectedRepoNodeExecutionLinked) {
    return "elevated";
  }

  return "stable";
}

function getSelectedNodeSystemType(
  selectedRepoNode: SelectedRepoNode | null
): string {
  if (!selectedRepoNode) return "unassigned";

  if (selectedRepoNode.node_type === "root") return "entity_root";
  if (selectedRepoNode.node_type === "domain") return "domain_node";
  if (selectedRepoNode.node_type === "role") return "role_node";
  if (selectedRepoNode.node_type === "execution") return "execution_node";
  if (selectedRepoNode.node_type === "evidence") return "evidence_node";

  return `${selectedRepoNode.node_type}_node`;
}

function getSelectedNodeDirective(input: {
  selectedRepoNode: SelectedRepoNode | null;
  selectedNodeExecutionLinked: boolean;
  selectedNodeRiskBand: "critical" | "elevated" | "stable";
  selectedNodeExecutionActions: Array<{
    action_id: string;
    domain: string;
    title: string;
    description: string;
    owner_role: string;
    expected_outcome: string;
    phase: string;
  }>;
}): {
  directive: string;
  why_it_matters: string;
  next_move: string;
} {
  const {
    selectedRepoNode,
    selectedNodeExecutionLinked,
    selectedNodeRiskBand,
    selectedNodeExecutionActions,
  } = input;

  if (!selectedRepoNode) {
    return {
      directive: "Select structural node",
      why_it_matters:
        "No node is currently selected, so no node-level directive can be issued.",
      next_move: "Choose a node from the runtime repository.",
    };
  }

  if (selectedNodeExecutionActions.length > 0) {
    return {
      directive: selectedNodeExecutionActions[0].title,
      why_it_matters: selectedNodeExecutionLinked
        ? "This node is already attached to the active execution path and directly influences structural recovery."
        : "This node has actionable logic available and should be evaluated for routing into execution.",
      next_move:
        selectedNodeExecutionActions.length > 1
          ? selectedNodeExecutionActions[1].title
          : "No second queued action.",
    };
  }

  if (selectedNodeRiskBand === "critical") {
    return {
      directive: "Contain structural degradation",
      why_it_matters:
        "The selected node shows critical fragility or degradation and may propagate instability across dependent layers.",
      next_move: selectedNodeExecutionLinked
        ? "Review current intervention coverage."
        : "Attach node to execution path.",
    };
  }

  if (selectedNodeExecutionLinked) {
    return {
      directive: "Monitor active intervention coverage",
      why_it_matters:
        "The node is already inside the active program path and should be tracked for intervention effectiveness.",
      next_move: "Inspect evidence and downstream effects.",
    };
  }

  return {
    directive: "Evaluate structural exposure",
    why_it_matters:
      "This node is currently outside the active execution path and may still represent latent structural risk.",
    next_move: "Review dependencies, evidence, and intervention eligibility.",
  };
}

function getSelectedNodePrioritySignal(input: {
  selectedRepoNode: SelectedRepoNode | null;
  selectedNodeExecutionLinked: boolean;
  selectedNodeRiskBand: "critical" | "elevated" | "stable";
  selectedNodeDependenciesCount: number;
  selectedNodeExecutionActionsCount: number;
}): {
  priority_label: "P1" | "P2" | "P3";
  coverage_state: "covered" | "uncovered";
  structural_urgency: "critical" | "high" | "medium" | "stable";
  cascade_risk: "critical" | "high" | "medium" | "stable";
  operator_command: string;
} {
  const {
    selectedRepoNode,
    selectedNodeExecutionLinked,
    selectedNodeRiskBand,
    selectedNodeDependenciesCount,
    selectedNodeExecutionActionsCount,
  } = input;

  if (!selectedRepoNode) {
    return {
      priority_label: "P3",
      coverage_state: "uncovered",
      structural_urgency: "stable",
      cascade_risk: "stable",
      operator_command: "Select node",
    };
  }

  const coverage_state = selectedNodeExecutionLinked ? "covered" : "uncovered";

  const structural_urgency =
    selectedNodeRiskBand === "critical"
      ? selectedNodeExecutionLinked
        ? "high"
        : "critical"
      : selectedNodeRiskBand === "elevated"
      ? "medium"
      : "stable";

  const cascade_risk =
    selectedNodeDependenciesCount >= 5
      ? "critical"
      : selectedNodeDependenciesCount >= 3
      ? "high"
      : selectedNodeDependenciesCount >= 1
      ? "medium"
      : "stable";

  const priority_label =
    structural_urgency === "critical"
      ? "P1"
      : structural_urgency === "high"
      ? "P1"
      : structural_urgency === "medium"
      ? "P2"
      : "P3";

  const operator_command =
    selectedNodeExecutionActionsCount > 0
      ? "Execute linked action"
      : coverage_state === "uncovered" && structural_urgency === "critical"
      ? "Route node into program"
      : coverage_state === "covered"
      ? "Monitor intervention path"
      : "Inspect structural exposure";

  return {
    priority_label,
    coverage_state,
    structural_urgency,
    cascade_risk,
    operator_command,
  };
}

function getRepoNodeMarkers(
  node: RepoTreeNode,
  twinStructure: TwinStructure | null,
  crcpProgram: CrcpProgram | null
): {
  isCritical: boolean;
  isProgramLinked: boolean;
  isEvidencePoor: boolean;
} {
  const status = getRepoNodeStatusStatic(node, twinStructure, crcpProgram);
  const evidenceCount = getRepoNodeEvidenceCount(node, twinStructure);
  const isProgramLinked = isRepoNodeProgramLinked(
    node,
    twinStructure,
    crcpProgram
  );

  return {
    isCritical: ["critical", "fragile", "degraded"].includes(
      String(status).toLowerCase()
    ),
    isProgramLinked,
    isEvidencePoor: node.selectable === true && evidenceCount <= 1,
  };
}

// ===============================
// EXECUTION STATE
// ===============================
const isCaptureComplete =
  totalQuestionCount > 0 && answeredCount === totalQuestionCount;

const isRunDisabled =
  loading ||
  localValidationIssues.length > 0 ||
  !isCaptureComplete ||
  !organizationId ||
  !isHeaderLocked;

  function updateMetadata<K extends keyof MetadataState>(
    key: K,
    value: MetadataState[K]
  ) {
    if (isHeaderLocked) {
      return;
    }

    setMetadata((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "sector") {
        const sectorValue = String(value);
        const nextSubsectors = SUBSECTOR_OPTIONS[sectorValue] ?? [];
        next.subsector = nextSubsectors[0] ?? "";
      }

      if (key === "country") {
        const countryValue = String(value);
        const nextCities = COUNTRY_OPTIONS[countryValue]?.cities ?? [];
        next.city = nextCities[0] ?? "";
      }

      return next;
    });

    setResponse(null);
    setError(null);
  }

  function lockHeader() {
    if (localValidationIssues.length > 0) {
      setError("Resolve header validation issues before locking Block 0.");
      return;
    }

    setIsHeaderLocked(true);
    setError(null);
    setResponse(null);
  }

  function unlockHeader() {
    setIsHeaderLocked(false);
    setAnswers({});
    setResponse(null);
    setError(null);
    setCurrentQuestionIndex(0);
  }

  function autofillRandomAnswers() {
  if (!isHeaderLocked) {
    setError("Lock Block 0 before using Autofill Random.");
    return;
  }

  if (allQuestions.length === 0) {
    setError("No canonical questions loaded yet.");
    return;
  }

  const nextAnswers = buildRandomAnswerMap(allQuestions, metadata);

  setAnswers(nextAnswers);
  setResponse(null);
  setError(null);
  setCurrentQuestionIndex(0);
}

  function updateAnswer(question: CrcpQuestion, value?: CrcpAnswerValue) {
    if (!isHeaderLocked) {
      setError("Lock Block 0 before answering the canonical questionnaire.");
      return;
    }

    if (question.question_id === "ID_01") {
      return;
    }

    if (question.question_id === "ID_02") {
      return;
    }

    setAnswers((prev) => {
      const next = { ...prev };

      if (value === undefined) {
        delete next[question.question_id];
      } else {
        next[question.question_id] = value;
      }

      return next;
    });

    setResponse(null);
    setError(null);
  }

  function goToNextQuestion() {
    setCurrentQuestionIndex((prev) =>
      Math.min(prev + 1, Math.max(allQuestions.length - 1, 0))
    );
  }

  function goToPreviousQuestion() {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }

  function goToNextPendingQuestion() {
    if (allQuestions.length === 0) {
      return;
    }

    const nextPending = allQuestions.findIndex(
      (question, index) =>
        index > currentQuestionIndex &&
        !isAnswered(getQuestionValue(question, metadata, answers))
    );

    if (nextPending >= 0) {
      setCurrentQuestionIndex(nextPending);
      return;
    }

    const firstPending = findFirstPendingQuestionIndex(
      allQuestions,
      metadata,
      answers
    );
    setCurrentQuestionIndex(firstPending);
  }

  async function handleRun(): Promise<void> {
    if (localValidationIssues.length > 0) {
      setError(
        "Local validation failed. Resolve the issues before running CRCP."
      );
      setResponse(null);
      return;
    }

    if (!isHeaderLocked) {
      setError("Lock Block 0 before executing CRCP.");
      setResponse(null);
      return;
    }

    if (answeredCount !== totalQuestionCount) {
      setError(
        `CRCP capture is incomplete. Answer all ${totalQuestionCount} questions before execution.`
      );
      setResponse(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/internal/crcp/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildRuntimePayload(organizationId, metadata, allQuestions, answers)
        ),
      });

      const data = (await res.json()) as CrcpRunApiResponse;
      setResponse(data);

      if (!res.ok || !data.ok) {
        setError(data.error || `Request failed: ${res.status}`);
      }
    } catch (err) {
      setResponse(null);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function cycleExecutionStatus(actionId: string) {
  setExecutionTrackerState((prev) =>
    prev.map((item) =>
      item.action_id === actionId
        ? { ...item, status: getNextExecutionStatus(item.status) }
        : item
    )
  );
}

function autofillSimulation() {
  if (!isHeaderLocked) {
    setError("Lock Block 0 before running simulation autofill.");
    return;
  }

  if (allQuestions.length === 0) {
    setError("No canonical questions loaded yet.");
    return;
  }

  const nextAnswers = buildSimulatedAnswerMap(
    allQuestions,
    metadata,
    simulationProfile
  );

  setAnswers(nextAnswers);
  setResponse(null);
  setError(null);
  setCurrentQuestionIndex(0);
}

  function renderQuestionInput(question: CrcpQuestion) {
    const value = getQuestionValue(question, metadata, answers);

    if (question.question_id === "ID_01") {
      return (
        <input
          style={disabledInputStyle}
          value={metadata.business_name}
          disabled
          readOnly
        />
      );
    }

    if (question.question_id === "ID_02") {
      return (
        <div style={sectionBlockStyle}>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>
            This field is controlled by the protocol header.
          </div>
          <Chips values={[metadata.sector]} />
        </div>
      );
    }

    if (question.type === "yes_no") {
      const current = typeof value === "string" ? value : "";

      return (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["yes", "no"].map((option) => {
              const selected = current === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer(question, option)}
                  style={{
                    ...actionButtonBaseStyle,
                    minWidth: 110,
                    background: selected ? "#1e293b" : "#0f172a",
                    cursor: "pointer",
                  }}
                >
                  {option}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => updateAnswer(question, undefined)}
              style={{
                ...actionButtonBaseStyle,
                minWidth: 96,
                background: "#0f172a",
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              clear
            </button>
          </div>

          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            selected: {current || "not_selected"}
          </div>
        </div>
      );
    }

    if (question.type === "scale_1_5") {
      const numericValue = typeof value === "number" ? value : undefined;

      return (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map((step) => {
              const selected = numericValue === step;

              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => updateAnswer(question, step)}
                  style={{
                    ...actionButtonBaseStyle,
                    minWidth: 64,
                    padding: "11px 14px",
                    background: selected ? "#1e293b" : "#0f172a",
                    cursor: "pointer",
                  }}
                >
                  {step}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => updateAnswer(question, undefined)}
              style={{
                ...actionButtonBaseStyle,
                minWidth: 96,
                background: "#0f172a",
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              clear
            </button>
          </div>

          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            selected:{" "}
            {numericValue
              ? `${numericValue} · ${renderScaleLabel(numericValue)}`
              : "not_selected"}
          </div>
        </div>
      );
    }

    if (question.type === "numeric") {
      const current =
        typeof value === "number" && Number.isFinite(value) ? String(value) : "";

      return (
        <input
          style={inputStyle}
          type="number"
          value={current}
          onChange={(e) => {
            const next = e.target.value.trim();
            updateAnswer(question, next === "" ? undefined : Number(next));
          }}
          placeholder="Enter numeric value"
        />
      );
    }

    if (question.type === "multi_select") {
      const options = SINGLE_SELECT_OPTIONS[question.question_id];

      if (options && options.length > 0) {
        const current = typeof value === "string" ? value : "";

        return (
          <div style={{ display: "grid", gap: 12 }}>
            <select
              style={inputStyle}
              value={current}
              onChange={(e) =>
                updateAnswer(
                  question,
                  e.target.value.trim() ? e.target.value : undefined
                )
              }
            >
              <option value="">select</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {prettyLabel(option)}
                </option>
              ))}
            </select>

            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              selected: {current || "not_selected"}
            </div>
          </div>
        );
      }

      const textValue = Array.isArray(value) ? value.join(", ") : "";

      return (
        <textarea
          style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
          value={textValue}
          onChange={(e) => {
            const parsed = normalizeMultiSelectText(e.target.value);
            updateAnswer(question, parsed.length > 0 ? parsed : undefined);
          }}
          placeholder="Enter one or more values, separated by commas"
        />
      );
    }

    return (
      <input
        style={inputStyle}
        value={typeof value === "string" ? value : ""}
        onChange={(e) =>
          updateAnswer(
            question,
            e.target.value.trim() ? e.target.value : undefined
          )
        }
        placeholder="Enter response"
      />
    );
  }

  return (
    <AppShell
      title="NEXUS™ CRCP Lab"
      subtitle="Structured one-by-one capture surface for the canonical Client Reality Capture Protocol."
    >
      <section className={styles.contextBar}>
        <div className={styles.contextTitle}>CRCP Lab Control Surface</div>

        <div className={styles.contextGrid}>
          <div className={styles.contextItem}>
            <div className={styles.contextLabel}>Mode</div>
            <div>Sequential protocol capture</div>
          </div>
          <div className={styles.contextItem}>
            <div className={styles.contextLabel}>Payload</div>
            <div>System-built from canonical answers</div>
          </div>
          <div className={styles.contextItem}>
            <div className={styles.contextLabel}>Execution</div>
            <div>
              {isHeaderLocked
                ? "Ready after capture review"
                : "Header must be locked first"}
            </div>
          </div>
        </div>

        <div
          style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          {!isHeaderLocked ? (
            <button
              type="button"
              onClick={lockHeader}
              disabled={localValidationIssues.length > 0}
              style={{
                ...actionButtonBaseStyle,
                background:
                  localValidationIssues.length > 0 ? "#0f172a" : "#1e293b",
                cursor:
                  localValidationIssues.length > 0
                    ? "not-allowed"
                    : "pointer",
                opacity: localValidationIssues.length > 0 ? 0.7 : 1,
              }}
            >
              Lock Header
            </button>
          ) : (
            <button
              type="button"
              onClick={unlockHeader}
              style={{
                ...actionButtonBaseStyle,
                background: "#0f172a",
                cursor: "pointer",
              }}
            >
              Unlock Header
            </button>
          )}

          <button
            type="button"
            onClick={goToNextPendingQuestion}
            disabled={allQuestions.length === 0 || !isHeaderLocked}
            style={{
              ...actionButtonBaseStyle,
              background: "#0f172a",
              cursor:
                allQuestions.length === 0 || !isHeaderLocked
                  ? "not-allowed"
                  : "pointer",
              opacity: allQuestions.length === 0 || !isHeaderLocked ? 0.7 : 1,
            }}
          >
            Next Pending
          </button>

          <select
  value={simulationProfile}
  onChange={(e) =>
    setSimulationProfile(e.target.value as SimulationProfile)
  }
  style={{
    ...inputStyle,
    width: 180,
    padding: "10px 12px",
  }}
>
  {SIMULATION_PROFILE_OPTIONS.map((profile) => (
    <option key={profile} value={profile}>
      {prettyLabel(profile)}
    </option>
  ))}
</select>

<button
  type="button"
  onClick={autofillSimulation}
  disabled={!isHeaderLocked || allQuestions.length === 0}
  style={{
    ...actionButtonBaseStyle,
    background: "#0f172a",
    cursor:
      !isHeaderLocked || allQuestions.length === 0
        ? "not-allowed"
        : "pointer",
    opacity: !isHeaderLocked || allQuestions.length === 0 ? 0.7 : 1,
  }}
>
  Autofill Simulated
</button>

          <button
  type="button"
  onClick={autofillRandomAnswers}
  disabled={allQuestions.length === 0 || !isHeaderLocked}
  style={{
    ...actionButtonBaseStyle,
    background: "#0f172a",
    cursor:
      allQuestions.length === 0 || !isHeaderLocked
        ? "not-allowed"
        : "pointer",
    opacity: allQuestions.length === 0 || !isHeaderLocked ? 0.7 : 1,
  }}
>
  Autofill Random
</button>

          <div style={{ fontSize: 12, color: "#94a3b8", alignSelf: "center" }}>
  {isHeaderLocked
    ? `Capture header locked. Simulation profile: ${prettyLabel(
        simulationProfile
      )}.`
    : "Confirm country, city, sector, subsector, and business identity before continuing."}
</div>
        </div>
      </section>

      <div className={styles.grid}>
        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Block 0 — Intake Header</h2>
          <div className={styles.meta}>
            protocol identity and system-assigned organization context
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
              marginTop: 16,
            }}
          >
            <FieldShell
              label="Organization ID"
              helper="Assigned automatically by the system."
            >
              <input style={disabledInputStyle} value={organizationId} readOnly />
            </FieldShell>

            <FieldShell label="Sector">
              <select
                style={isHeaderLocked ? disabledInputStyle : inputStyle}
                value={metadata.sector}
                onChange={(e) => updateMetadata("sector", e.target.value)}
                disabled={isHeaderLocked}
              >
                <option value="restaurant">restaurant</option>
                <option value="retail">retail</option>
                <option value="services">services</option>
                <option value="construction">construction</option>
                <option value="health">health</option>
                <option value="logistics">logistics</option>
                <option value="technology">technology</option>
                <option value="education">education</option>
                <option value="hospitality">hospitality</option>
                <option value="general">general</option>
              </select>
            </FieldShell>

            <FieldShell label="Subsector">
              <select
                style={isHeaderLocked ? disabledInputStyle : inputStyle}
                value={metadata.subsector}
                onChange={(e) => updateMetadata("subsector", e.target.value)}
                disabled={isHeaderLocked}
              >
                {availableSubsectors.map((subsector) => (
                  <option key={subsector} value={subsector}>
                    {prettyLabel(subsector)}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label="Country">
              <select
                style={isHeaderLocked ? disabledInputStyle : inputStyle}
                value={metadata.country}
                onChange={(e) => updateMetadata("country", e.target.value)}
                disabled={isHeaderLocked}
              >
                {Object.entries(COUNTRY_OPTIONS).map(([code, config]) => (
                  <option key={code} value={code}>
                    {config.label}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label="City">
              <select
                style={isHeaderLocked ? disabledInputStyle : inputStyle}
                value={metadata.city}
                onChange={(e) => updateMetadata("city", e.target.value)}
                disabled={isHeaderLocked}
              >
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label="Business Name">
              <input
                style={isHeaderLocked ? disabledInputStyle : inputStyle}
                value={metadata.business_name}
                onChange={(e) => updateMetadata("business_name", e.target.value)}
                disabled={isHeaderLocked}
              />
            </FieldShell>
          </div>
        </section>

        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Block 0A — Protocol Progress</h2>
          <div className={styles.meta}>live capture coverage</div>

          <div className={styles.miniGrid} style={{ marginTop: 16 }}>
            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Total Questions</h3>
                <span className={toneClass("active")}>catalog</span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Count</div>
                  <div className={styles.miniStatValue}>{totalQuestionCount}</div>
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Identity</h3>
                <span className={toneClass("active")}>base</span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Questions</div>
                  <div className={styles.miniStatValue}>
                    {questionCatalog?.identityQuestions.length ?? 0}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Adaptive</h3>
                <span className={toneClass("active")}>sector</span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Questions</div>
                  <div className={styles.miniStatValue}>
                    {questionCatalog?.adaptiveQuestions.length ?? 0}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Answered</h3>
                <span
                  className={toneClass(
                    answeredCount > 0 ? "answered" : "pending"
                  )}
                >
                  {answeredCount > 0 ? "live" : "idle"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Captured</div>
                  <div className={styles.miniStatValue}>{answeredCount}</div>
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Remaining</h3>
                <span
                  className={toneClass(
                    remainingCount === 0 ? "complete" : "pending"
                  )}
                >
                  {remainingCount === 0 ? "clear" : "open"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Pending</div>
                  <div className={styles.miniStatValue}>{remainingCount}</div>
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Progress</h3>
                <span
                  className={toneClass(
                    isCaptureComplete ? "complete" : "pending"
                  )}
                >
                  {isCaptureComplete ? "complete" : "in progress"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Coverage</div>
                  <div className={styles.miniStatValue}>{progressPercent}%</div>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.miniGrid} style={{ marginTop: 18 }}>
            {protocolDomainStats.map((domainStat) => (
              <div key={domainStat.domain} className={styles.miniCard}>
                <div className={styles.miniCardHeader}>
                  <h3 className={styles.miniCardTitle}>
                    {DOMAIN_LABELS[domainStat.domain] || domainStat.domain}
                  </h3>
                  <span className={toneClass(domainStat.state)}>
                    {domainStat.state}
                  </span>
                </div>

                <div className={styles.miniCardBody}>
                  <div className={styles.miniStat}>
                    <div className={styles.miniStatLabel}>Coverage</div>
                    <div className={styles.miniStatValue}>
                      {domainStat.answered}/{domainStat.total}
                    </div>
                  </div>

                  <div className={styles.miniStat}>
                    <div className={styles.miniStatLabel}>Progress</div>
                    <div className={styles.miniStatValue}>
                      {domainStat.percent}%
                    </div>
                  </div>

                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${domainStat.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Block 0B — Context Snapshot</h2>
          <div className={styles.meta}>
            locked operational context summary for downstream capture consistency
          </div>

          <div className={styles.miniGrid} style={{ marginTop: 16 }}>
            {headerSnapshot.map((item) => (
              <div key={item.label} className={styles.miniCard}>
                <div className={styles.miniCardBody}>
                  <div className={styles.miniStat}>
                    <div className={styles.miniStatLabel}>{item.label}</div>
                    <div className={styles.miniStatValue}>{item.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {localValidationIssues.length > 0 ? (
          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>Block 0C — Local Validation</h2>
            <div className={styles.meta}>client-side intake guardrails</div>
            <div className={styles.list}>
              {localValidationIssues.map((issue) => (
                <div key={issue} className={styles.listItem}>
                  <div className={styles.error}>{issue}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Block 1 — Active Question</h2>
          <div className={styles.meta}>
            one-by-one guided intake for canonical CRCP execution
          </div>

          {!isHeaderLocked ? (
            <div style={{ ...sectionBlockStyle, marginTop: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                Header unlock state detected
              </div>
              <div style={{ color: "#94a3b8", fontSize: 14 }}>
                Lock Block 0 before answering the canonical questionnaire.
              </div>
            </div>
          ) : questionsLoading ? (
            <div className={styles.meta} style={{ marginTop: 14 }}>
              Loading canonical questions...
            </div>
          ) : questionsError ? (
            <div className={styles.error} style={{ marginTop: 14 }}>
              {questionsError}
            </div>
          ) : currentQuestion ? (
            <>
              <div className={styles.miniGrid} style={{ marginTop: 16 }}>
                <div className={styles.miniCard}>
                  <div className={styles.miniCardHeader}>
                    <h3 className={styles.miniCardTitle}>Question</h3>
                    <span className={toneClass("active")}>
                      {currentQuestionIndex + 1}/{totalQuestionCount}
                    </span>
                  </div>
                  <div className={styles.miniCardBody}>
                    <div className={styles.miniStat}>
                      <div className={styles.miniStatLabel}>Question ID</div>
                      <div className={styles.miniStatValue}>
                        {currentQuestion.question_id}
                      </div>
                    </div>
                    <div className={styles.miniStat}>
                      <div className={styles.miniStatLabel}>Domain</div>
                      <div className={styles.miniStatValue}>
                        {DOMAIN_LABELS[currentQuestion.domain] ||
                          currentQuestion.domain}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <div className={styles.miniCardHeader}>
                    <h3 className={styles.miniCardTitle}>Scoring Profile</h3>
                    <span
                      className={toneClass(currentQuestion.scoring_direction)}
                    >
                      {currentQuestion.scoring_direction || "neutral"}
                    </span>
                  </div>
                  <div className={styles.miniCardBody}>
                    <div className={styles.miniStat}>
                      <div className={styles.miniStatLabel}>Type</div>
                      <div className={styles.miniStatValue}>
                        {currentQuestion.type}
                      </div>
                    </div>
                    <div className={styles.miniStat}>
                      <div className={styles.miniStatLabel}>Weight</div>
                      <div className={styles.miniStatValue}>
                        {String(currentQuestion.weight)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <div className={styles.miniCardHeader}>
                    <h3 className={styles.miniCardTitle}>Coverage State</h3>
                    <span
                      className={toneClass(
                        isAnswered(currentQuestionValue)
                          ? "answered"
                          : "pending"
                      )}
                    >
                      {isAnswered(currentQuestionValue)
                        ? "answered"
                        : "pending"}
                    </span>
                  </div>
                  <div className={styles.miniCardBody}>
                    <div className={styles.miniStat}>
                      <div className={styles.miniStatLabel}>
                        Protocol Progress
                      </div>
                      <div className={styles.miniStatValue}>
                        {progressPercent}%
                      </div>
                    </div>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...sectionBlockStyle, marginTop: 18 }}>
                <div
                  style={{
                    fontSize: 22,
                    lineHeight: 1.35,
                    fontWeight: 800,
                    marginBottom: 18,
                  }}
                >
                  {currentQuestion.text}
                </div>

                {renderQuestionInput(currentQuestion)}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 18,
                }}
              >
                <button
                  type="button"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  style={{
                    ...actionButtonBaseStyle,
                    background:
                      currentQuestionIndex === 0 ? "#0f172a" : "#1e293b",
                    cursor:
                      currentQuestionIndex === 0 ? "not-allowed" : "pointer",
                    opacity: currentQuestionIndex === 0 ? 0.65 : 1,
                  }}
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex >= totalQuestionCount - 1}
                  style={{
                    ...actionButtonBaseStyle,
                    background:
                      currentQuestionIndex >= totalQuestionCount - 1
                        ? "#0f172a"
                        : "#1e293b",
                    cursor:
                      currentQuestionIndex >= totalQuestionCount - 1
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      currentQuestionIndex >= totalQuestionCount - 1
                        ? 0.65
                        : 1,
                  }}
                >
                  Next
                </button>

                <button
                  type="button"
                  onClick={goToNextPendingQuestion}
                  disabled={allQuestions.length === 0}
                  style={{
                    ...actionButtonBaseStyle,
                    background: "#0f172a",
                    cursor:
                      allQuestions.length === 0 ? "not-allowed" : "pointer",
                    opacity: allQuestions.length === 0 ? 0.65 : 1,
                  }}
                >
                  Jump to Pending
                </button>

                <div
                  style={{
                    alignSelf: "center",
                    fontSize: 12,
                    color: "#94a3b8",
                  }}
                >
                  Answers are retained live as you move through the protocol.
                </div>
              </div>
            </>
          ) : (
            <div className={styles.empty} style={{ marginTop: 12 }}>
              No canonical question loaded.
            </div>
          )}
        </section>

        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Block 1A — Protocol Matrix Status</h2>
          <div className={styles.meta}>
            institutional view of structural layers under capture
          </div>

          <div className={styles.miniGrid} style={{ marginTop: 16 }}>
            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Identity Layer</h3>
                <span className={toneClass(identityStat?.state)}>
                  {identityStat?.state || "pending"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Purpose</div>
                  <div className={styles.miniStatValue}>Entity resolution</div>
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>
                  Operational Signal Formation
                </h3>
                <span className={toneClass(operationsStat?.state)}>
                  {operationsStat?.state || "pending"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Purpose</div>
                  <div className={styles.miniStatValue}>Execution structure</div>
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>
                  Reporting Reliability Surface
                </h3>
                <span className={toneClass(reportingStat?.state)}>
                  {reportingStat?.state || "pending"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Purpose</div>
                  <div className={styles.miniStatValue}>Visibility integrity</div>
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>
                  Financial Pressure Estimation
                </h3>
                <span className={toneClass(financeStat?.state)}>
                  {financeStat?.state || "pending"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Purpose</div>
                  <div className={styles.miniStatValue}>Stress exposure</div>
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Decision Layer</h3>
                <span className={toneClass(result ? "ready" : "pending")}>
                  {result ? "ready" : "pending_run"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Purpose</div>
                  <div className={styles.miniStatValue}>
                    CRCP execution output
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Block 1B — Capture Summary</h2>
          <div className={styles.meta}>
            compact operational reading of the most relevant captured inputs
          </div>

          <div className={styles.miniGrid} style={{ marginTop: 16 }}>
            {captureSummary.map((item) => (
              <div key={item.label} className={styles.miniCard}>
                <div className={styles.miniCardBody}>
                  <div className={styles.miniStat}>
                    <div className={styles.miniStatLabel}>{item.label}</div>
                    <div className={styles.miniStatValue}>
                      {prettyLabel(item.value)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Block 1C — Execution Gate</h2>
          <div className={styles.meta}>
            controlled transition from capture to canonical CRCP execution
          </div>

          <div className={styles.miniGrid} style={{ marginTop: 16 }}>
            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Capture Status</h3>
                <span
                  className={toneClass(
                    isCaptureComplete ? "ready" : "pending"
                  )}
                >
                  {isCaptureComplete ? "ready" : "pending"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Answered</div>
                  <div className={styles.miniStatValue}>
                    {answeredCount}/{totalQuestionCount}
                  </div>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Execution Readiness</h3>
                <span
                  className={toneClass(
                    localValidationIssues.length === 0 && isHeaderLocked
                      ? "valid"
                      : "pending"
                  )}
                >
                  {localValidationIssues.length === 0 && isHeaderLocked
                    ? "valid"
                    : "blocked"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Organization ID</div>
                  <div className={styles.miniStatValue}>
                    {organizationId || "n/a"}
                  </div>
                </div>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Local Validation</div>
                  <div className={styles.miniStatValue}>
                    {localValidationIssues.length === 0
                      ? "No blocking issues"
                      : `${localValidationIssues.length} issue(s) detected`}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.miniCardHeader}>
                <h3 className={styles.miniCardTitle}>Execution Action</h3>
                <span
                  className={toneClass(isRunDisabled ? "pending" : "unlocked")}
                >
                  {isRunDisabled ? "blocked" : "unlocked"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>State</div>
                  <div className={styles.miniStatValue}>
                    {isRunDisabled
                      ? "Resolve pending capture conditions"
                      : "Ready to execute canonical pipeline"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...sectionBlockStyle, marginTop: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                  {isCaptureComplete
                    ? "Capture complete. You can now execute CRCP."
                    : "Complete all questions before execution."}
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                  Use the execution gate only after confirming the final
                  responses.
                </div>
              </div>

              <button
                onClick={handleRun}
                disabled={isRunDisabled}
                style={{
                  ...actionButtonBaseStyle,
                  minWidth: 180,
                  background: isRunDisabled ? "#0f172a" : "#1e293b",
                  cursor: isRunDisabled ? "not-allowed" : "pointer",
                  opacity: isRunDisabled ? 0.7 : 1,
                }}
              >
                {loading ? "Running CRCP..." : "Run CRCP"}
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>Execution Error</h2>
            <div className={styles.error}>{error}</div>
          </section>
        ) : null}

        {backendValidationIssues.length > 0 ? (
          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>
              Block 1D — Backend Validation Issues
            </h2>
            <div className={styles.meta}>
              canonical engine validation response
            </div>
            <div className={styles.list}>
              {backendValidationIssues.map((issue) => (
                <div
                  key={`${issue.code}-${issue.field}-${issue.message}`}
                  className={styles.listItem}
                >
                  <Row label="Code">{issue.code}</Row>
                  <Row label="Field">{issue.field}</Row>
                  <Row label="Message">{issue.message}</Row>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {result &&
        result.scores &&
        result.decision &&
        result.snapshot &&
        result.twin_seed ? (
          <>
            <section className={`${styles.card} ${styles.fullWidth}`}>
              <h2 className={styles.cardTitle}>Executive Decision Banner</h2>
              <div className={styles.meta}>
                primary execution reading for fast operator interpretation
              </div>

              <div style={{ ...sectionBlockStyle, marginTop: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                  {prettyLabel(result.decision.decision_label)}
                </div>

                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: 14,
                    lineHeight: 1.55,
                    marginBottom: 14,
                  }}
                >
                  {result.snapshot.executive_summary}
                </div>

                <div className={styles.chips}>
                  <span className={toneClass(result.decision.priority)}>
                    {result.decision.priority}
                  </span>
                  <span className={toneClass(result.snapshot.state_label)}>
                    {result.snapshot.state_label}
                  </span>
                  <span className={toneClass(result.decision.readiness_level)}>
                    {result.decision.readiness_level}
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Block A — Context & Decision</h2>
              <div className={styles.meta}>executedAt: {result.executed_at}</div>

              <Row label="Organization">
                {result.intake.context.organization_id}
              </Row>
              <Row label="Sector">{result.intake.context.sector}</Row>
              <Row label="Subsector">
                {result.intake.context.subsector || "n/a"}
              </Row>
              <Row label="Country">{result.intake.context.country || "n/a"}</Row>
              <Row label="City">{result.intake.context.city || "n/a"}</Row>
              <Row label="State">
                <span className={toneClass(result.snapshot.state_label)}>
                  {result.snapshot.state_label}
                </span>
              </Row>
              <Row label="Decision">
                <span className={toneClass(result.decision.decision_label)}>
                  {result.decision.decision_label}
                </span>
              </Row>
              <Row label="Priority">
                <span className={toneClass(result.decision.priority)}>
                  {result.decision.priority}
                </span>
              </Row>
              <Row label="Readiness">{result.decision.readiness_level}</Row>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Block B — Baseline Scores</h2>
              <div className={styles.meta}>canonical score surface</div>

              <Row label="Operational Maturity">
                {formatResultScore(result.scores.operational_maturity)}
              </Row>
              <Row label="Financial Pressure">
                {formatResultScore(result.scores.financial_pressure)}
              </Row>
              <Row label="Reporting Reliability">
                {formatResultScore(result.scores.reporting_reliability)}
              </Row>
              <Row label="Structural Risk">
                {formatResultScore(result.scores.structural_risk)}
              </Row>
              <Row label="Commercial Strength">
                {formatResultScore(result.scores.commercial_strength)}
              </Row>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Block C — Signals & Constraints</h2>
              <div className={styles.meta}>diagnostic interpretation layer</div>

              <Row label="Signals">
                <Chips
                  values={result.snapshot.active_signals.map(
                    (signal) =>
                      `${signal.code}:${signal.severity}${
                        signal.source_metric ? `:${signal.source_metric}` : ""
                      }`
                  )}
                />
              </Row>

              <Row label="Constraints">
                <Chips
                  values={result.snapshot.active_constraints.map(
                    (constraint) => `${constraint.code}:${constraint.severity}`
                  )}
                />
              </Row>

              <Row label="Executive Summary">
                <div>{result.snapshot.executive_summary}</div>
              </Row>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Block D — Twin Seed</h2>
              <div className={styles.meta}>
                foundational twin initialization layer
              </div>

              <Row label="Twin Seed ID">
                <div className={styles.mutedMono}>
                  {result.twin_seed.twin_seed_id}
                </div>
              </Row>
              <Row label="Baseline State">
                {result.twin_seed.baseline_state.state_label}
              </Row>
              <Row label="Structural Hypothesis">
                <div>{result.twin_seed.structural_hypothesis}</div>
              </Row>
            </section>

            {twinSeedV2 ? (
              <>
                <section className={`${styles.card} ${styles.fullWidth}`}>
                  <h2 className={styles.cardTitle}>
                    Block D2 — Twin Seed V2 Intelligence Surface
                  </h2>
                  <div className={styles.meta}>
                    advanced twin intelligence, confidence, gap analysis, and activation path
                  </div>

                  <div className={styles.miniGrid} style={{ marginTop: 16 }}>
                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Twin Version</h3>
                        <span className={toneClass("active")}>
                          {twinSeedV2.twin_version}
                        </span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Twin Seed ID</div>
                          <div
                            className={styles.miniStatValue}
                            style={{ wordBreak: "break-word" }}
                          >
                            {twinSeedV2.twin_seed_id}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Lineage</h3>
                        <span className={toneClass("active")}>traceable</span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Lineage ID</div>
                          <div
                            className={styles.miniStatValue}
                            style={{ wordBreak: "break-word" }}
                          >
                            {twinSeedV2.lineage_id}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Confidence</h3>
                        <span className={toneClass(twinSeedV2.twin_confidence.level)}>
                          {twinSeedV2.twin_confidence.level}
                        </span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Score</div>
                          <div className={styles.miniStatValue}>
                            {twinSeedV2.twin_confidence.score.toFixed(2)} / 100
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Lifecycle Stage</h3>
                        <span className={toneClass("active")}>
                          {prettyLabel(twinSeedV2.activation_path.lifecycle_stage)}
                        </span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Priority</div>
                          <div className={styles.miniStatValue}>
                            {twinSeedV2.activation_path.recommended_priority}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>Block D3 — Gap Vector</h2>
                  <div className={styles.meta}>
                    weakest dimensions and structural severity concentration
                  </div>

                  <Row label="Weakest Dimension">
                    {prettyLabel(twinSeedV2.gap_vector.weakest_dimension)}
                  </Row>
                  <Row label="Weakest Score">
                    {twinSeedV2.gap_vector.weakest_score.toFixed(2)}
                  </Row>
                  <Row label="Second Weakest">
                    {twinSeedV2.gap_vector.second_weakest_dimension
                      ? prettyLabel(twinSeedV2.gap_vector.second_weakest_dimension)
                      : "n/a"}
                  </Row>
                  <Row label="Second Weakest Score">
                    {typeof twinSeedV2.gap_vector.second_weakest_score === "number"
                      ? twinSeedV2.gap_vector.second_weakest_score.toFixed(2)
                      : "n/a"}
                  </Row>
                  <Row label="Gap Severity">
                    {twinSeedV2.gap_vector.gap_severity.toFixed(2)}
                  </Row>
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>Block D4 — Activation Path</h2>
                  <div className={styles.meta}>
                    recommended transition logic for post-diagnostic execution
                  </div>

                  <Row label="Next Step">
                    {prettyLabel(twinSeedV2.activation_path.next_step)}
                  </Row>
                  <Row label="Recommended Program">
                    {prettyLabel(twinSeedV2.activation_path.recommended_program)}
                  </Row>
                  <Row label="Recommended Priority">
                    <span
                      className={toneClass(
                        twinSeedV2.activation_path.recommended_priority
                      )}
                    >
                      {twinSeedV2.activation_path.recommended_priority}
                    </span>
                  </Row>
                  <Row label="Lifecycle Stage">
                    {prettyLabel(twinSeedV2.activation_path.lifecycle_stage)}
                  </Row>
                </section>

                <section className={`${styles.card} ${styles.fullWidth}`}>
                  <h2 className={styles.cardTitle}>
                    Block D5 — Structural Vector Surface
                  </h2>
                  <div className={styles.meta}>
                    composite twin operating surface across core structural dimensions
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 14,
                      marginTop: 16,
                    }}
                  >
                    {twinVectorBars.map((item) => (
                      <div key={item.label} style={sectionBlockStyle}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            marginBottom: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#e2e8f0",
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#94a3b8",
                              fontWeight: 700,
                            }}
                          >
                            {item.value.toFixed(2)} / 100
                          </div>
                        </div>

                        <div className={styles.progressTrack}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={`${styles.card} ${styles.fullWidth}`}>
                  <h2 className={styles.cardTitle}>Block D6 — Twin Evidence</h2>
                  <div className={styles.meta}>
                    evidence quality and interpretive confidence support
                  </div>

                  <div className={styles.miniGrid} style={{ marginTop: 16 }}>
                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Answered Questions</h3>
                        <span className={toneClass("active")}>evidence</span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Count</div>
                          <div className={styles.miniStatValue}>
                            {twinSeedV2.evidence_summary.answered_questions}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Total Questions</h3>
                        <span className={toneClass("active")}>catalog</span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Count</div>
                          <div className={styles.miniStatValue}>
                            {twinSeedV2.evidence_summary.total_questions}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Coverage Percent</h3>
                        <span className={toneClass("active")}>coverage</span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Percent</div>
                          <div className={styles.miniStatValue}>
                            {twinSeedV2.evidence_summary.coverage_percent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Major Signals</h3>
                        <span className={toneClass("active")}>signal load</span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Count</div>
                          <div className={styles.miniStatValue}>
                            {twinSeedV2.evidence_summary.major_signal_count}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Major Constraints</h3>
                        <span className={toneClass("active")}>constraint load</span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Count</div>
                          <div className={styles.miniStatValue}>
                            {twinSeedV2.evidence_summary.major_constraint_count}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...sectionBlockStyle, marginTop: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                      Twin Confidence Rationale
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>
                      {twinSeedV2.twin_confidence.rationale}
                    </div>
                  </div>
                </section>
              </>
            ) : null}

            {twinStructure ? (
              <>
                <section className={`${styles.card} ${styles.fullWidth}`}>
                  <h2 className={styles.cardTitle}>
                    Block D7 — True Digital Twin Structure
                  </h2>
                  <div className={styles.meta}>
                    repository-grade structural representation of the organization
                  </div>

                  <div className={styles.miniGrid} style={{ marginTop: 16 }}>
                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Twin ID</h3>
                        <span className={toneClass("active")}>
                          {twinStructure.twin_version}
                        </span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Identifier</div>
                          <div
                            className={styles.miniStatValue}
                            style={{ wordBreak: "break-word" }}
                          >
                            {twinStructure.twin_id}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Twin Name</h3>
                        <span className={toneClass("active")}>structural</span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Name</div>
                          <div className={styles.miniStatValue}>
                            {twinStructure.twin_name}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Lineage</h3>
                        <span className={toneClass("active")}>traceable</span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Lineage ID</div>
                          <div
                            className={styles.miniStatValue}
                            style={{ wordBreak: "break-word" }}
                          >
                            {twinStructure.lineage_id}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.miniCard}>
                      <div className={styles.miniCardHeader}>
                        <h3 className={styles.miniCardTitle}>Root State</h3>
                        <span className={toneClass(twinStructure.root.state_label)}>
                          {twinStructure.root.state_label}
                        </span>
                      </div>
                      <div className={styles.miniCardBody}>
                        <div className={styles.miniStat}>
                          <div className={styles.miniStatLabel}>Lifecycle</div>
                          <div className={styles.miniStatValue}>
                            {prettyLabel(twinStructure.root.lifecycle_stage)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>Block D8 — Entity Root</h2>
                  <div className={styles.meta}>
                    canonical company root identity
                  </div>

                  <Row label="Entity ID">{twinStructure.root.entity_id}</Row>
                  <Row label="Legal Name">{twinStructure.root.legal_name}</Row>
                  <Row label="Display Name">{twinStructure.root.display_name}</Row>
                  <Row label="Sector">{twinStructure.root.sector}</Row>
                  <Row label="Subsector">
                    {twinStructure.root.subsector || "n/a"}
                  </Row>
                  <Row label="Country">{twinStructure.root.country || "n/a"}</Row>
                  <Row label="City">{twinStructure.root.city || "n/a"}</Row>
                  <Row label="Lifecycle">
                    {prettyLabel(twinStructure.root.lifecycle_stage)}
                  </Row>
                  <Row label="State">
                    <span className={toneClass(twinStructure.root.state_label)}>
                      {twinStructure.root.state_label}
                    </span>
                  </Row>
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>Block D9 — Domains</h2>
                  <div className={styles.meta}>
                    navigable business domains
                  </div>

                  {twinStructure.domains.length > 0 ? (
                    <div className={styles.list}>
                      {twinStructure.domains.map((domain) => (
                        <div key={domain.domain_id} className={styles.listItem}>
                          <Row label="Domain ID">{domain.domain_id}</Row>
                          <Row label="Name">{domain.domain_name}</Row>
                          <Row label="Label">{domain.domain_label}</Row>
                          <Row label="Status">
                            <span className={toneClass(domain.status)}>
                              {domain.status}
                            </span>
                          </Row>
                          <Row label="Owner Role">{domain.owner_role_id || "n/a"}</Row>
                          <Row label="Score">
                            {typeof domain.score === "number"
                              ? domain.score.toFixed(2)
                              : "n/a"}
                          </Row>
                          <Row label="Summary">{domain.summary || "n/a"}</Row>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.empty}>No domain nodes returned.</div>
                  )}
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>Block D10 — Roles</h2>
                  <div className={styles.meta}>
                    organizational role system
                  </div>

                  {twinStructure.roles.length > 0 ? (
                    <div className={styles.list}>
                      {twinStructure.roles.map((role) => (
                        <div key={role.role_id} className={styles.listItem}>
                          <Row label="Role ID">{role.role_id}</Row>
                          <Row label="Name">{role.role_name}</Row>
                          <Row label="Label">{role.role_label}</Row>
                          <Row label="Status">
                            <span className={toneClass(role.status)}>
                              {role.status}
                            </span>
                          </Row>
                          <Row label="Domain">{role.domain_id || "n/a"}</Row>
                          <Row label="Responsibility">
                            {role.responsibility_summary || "n/a"}
                          </Row>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.empty}>No role nodes returned.</div>
                  )}
                </section>

                <section className={`${styles.card} ${styles.fullWidth}`}>
                  <h2 className={styles.cardTitle}>Block D11 — Evidence Layer</h2>
                  <div className={styles.meta}>
                    supporting structural evidence
                  </div>

                  {twinStructure.evidence.length > 0 ? (
                    <div className={styles.list}>
                      {twinStructure.evidence.map((item) => (
                        <div key={item.evidence_id} className={styles.listItem}>
                          <Row label="Evidence ID">{item.evidence_id}</Row>
                          <Row label="Type">{item.evidence_type}</Row>
                          <Row label="Label">{item.label}</Row>
                          <Row label="Status">
                            <span className={toneClass(item.status)}>
                              {item.status}
                            </span>
                          </Row>
                          <Row label="Linked Domain">
                            {item.linked_domain_id || "n/a"}
                          </Row>
                          <Row label="Linked Role">
                            {item.linked_role_id || "n/a"}
                          </Row>
                          <Row label="Source Question">
                            {item.source_question_id || "n/a"}
                          </Row>
                          <Row label="Value">
                            {formatUnknownValue(item.value)}
                          </Row>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.empty}>No evidence items returned.</div>
                  )}
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>Block D12 — Activation Layer</h2>
                  <div className={styles.meta}>
                    post-diagnostic activation logic
                  </div>

                  <Row label="Activation Status">
                    <span className={toneClass(twinStructure.activation.activation_status)}>
                      {twinStructure.activation.activation_status}
                    </span>
                  </Row>
                  <Row label="Recommended Priority">
                    <span className={toneClass(twinStructure.activation.recommended_priority)}>
                      {twinStructure.activation.recommended_priority}
                    </span>
                  </Row>
                  <Row label="Recommended Program">
                    {twinStructure.activation.recommended_program}
                  </Row>
                  <Row label="Next Step">{twinStructure.activation.next_step}</Row>
                  <Row label="Summary">
                    {twinStructure.activation.activation_summary}
                  </Row>
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>Block D13 — Simulation Layer</h2>
                  <div className={styles.meta}>
                    future scenario architecture
                  </div>

                  {twinStructure.simulation ? (
                    <>
                      <Row label="Simulation Status">
                        <span className={toneClass(twinStructure.simulation.simulation_status)}>
                          {twinStructure.simulation.simulation_status}
                        </span>
                      </Row>
                      <Row label="Available Modes">
                        <Chips values={twinStructure.simulation.available_modes} />
                      </Row>
                      <Row label="Simulation Summary">
                        {twinStructure.simulation.simulation_summary}
                      </Row>
                    </>
                  ) : (
                    <div className={styles.empty}>
                      No simulation layer returned.
                    </div>
                  )}
                </section>

                <section className={`${styles.card} ${styles.fullWidth}`}>
                  <h2 className={styles.cardTitle}>Block D14 — Dependency Graph</h2>
                  <div className={styles.meta}>
                    structural relationships between twin nodes
                  </div>

                  {twinStructure.dependencies.length > 0 ? (
                    <div className={styles.list}>
                      {twinStructure.dependencies.map((edge) => (
                        <div key={edge.edge_id} className={styles.listItem}>
                          <Row label="Edge ID">{edge.edge_id}</Row>
                          <Row label="From">{edge.from_node_id}</Row>
                          <Row label="To">{edge.to_node_id}</Row>
                          <Row label="Relation">{edge.relation}</Row>
                          <Row label="Status">
                            {edge.status ? (
                              <span className={toneClass(edge.status)}>
                                {edge.status}
                              </span>
                            ) : (
                              "n/a"
                            )}
                          </Row>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.empty}>
                      No dependency edges returned.
                    </div>
                  )}
                </section>

               <section className={`${styles.card} ${styles.fullWidth}`}>
  <h2 className={styles.cardTitle}>Block D15 — Repository Runtime</h2>
  <div className={styles.meta}>
    primary navigable structural interface for the true digital twin
  </div>

  {twinStructure ? (
    <>
      <div className={styles.miniGrid} style={{ marginTop: 16 }}>
        <div className={styles.miniCard}>
          <div className={styles.miniCardHeader}>
            <h3 className={styles.miniCardTitle}>Business Identity</h3>
            <span className={toneClass(twinStructure.root.state_label)}>
              {prettyLabel(twinStructure.root.state_label)}
            </span>
          </div>
          <div className={styles.miniCardBody}>
            <div className={styles.miniStat}>
              <div className={styles.miniStatLabel}>Business Name</div>
              <div className={styles.miniStatValue}>
                {twinStructure.root.display_name}
              </div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatLabel}>Sector</div>
              <div className={styles.miniStatValue}>
                {prettyLabel(twinStructure.root.sector)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.miniCard}>
          <div className={styles.miniCardHeader}>
            <h3 className={styles.miniCardTitle}>Location</h3>
            <span className={toneClass("active")}>Live</span>
          </div>
          <div className={styles.miniCardBody}>
            <div className={styles.miniStat}>
              <div className={styles.miniStatLabel}>Country</div>
              <div className={styles.miniStatValue}>
                {twinStructure.root.country || "n/a"}
              </div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatLabel}>City</div>
              <div className={styles.miniStatValue}>
                {twinStructure.root.city || "n/a"}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.miniCard}>
          <div className={styles.miniCardHeader}>
            <h3 className={styles.miniCardTitle}>Lifecycle</h3>
            <span className={toneClass("active")}>
              {prettyLabel(twinStructure.root.lifecycle_stage)}
            </span>
          </div>
          <div className={styles.miniCardBody}>
            <div className={styles.miniStat}>
              <div className={styles.miniStatLabel}>Twin Name</div>
              <div className={styles.miniStatValue}>
                {twinStructure.twin_name}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.miniCard}>
          <div className={styles.miniCardHeader}>
            <h3 className={styles.miniCardTitle}>Execution Program</h3>
            <span
              className={toneClass(
                crcpProgram?.recommended_priority || "planned"
              )}
            >
              {crcpProgram?.recommended_priority || "n/a"}
            </span>
          </div>
          <div className={styles.miniCardBody}>
            <div className={styles.miniStat}>
              <div className={styles.miniStatLabel}>Program</div>
              <div className={styles.miniStatValue}>
                {crcpProgram?.program_label || "n/a"}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.miniCard}>
          <div className={styles.miniCardHeader}>
            <h3 className={styles.miniCardTitle}>Financial Layer</h3>
            <span className={toneClass(financeDomainNode?.status || "pending")}>
              {prettyLabel(financeDomainNode?.status || "pending")}
            </span>
          </div>
          <div className={styles.miniCardBody}>
            <div className={styles.miniStat}>
              <div className={styles.miniStatLabel}>Finance Score</div>
              <div className={styles.miniStatValue}>
                {typeof financeDomainNode?.score === "number"
                  ? `${financeDomainNode.score.toFixed(2)} / 100`
                  : "n/a"}
              </div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatLabel}>Evidence</div>
              <div className={styles.miniStatValue}>{financeEvidenceCount}</div>
            </div>
          </div>
        </div>

        <div className={styles.miniCard}>
          <div className={styles.miniCardHeader}>
            <h3 className={styles.miniCardTitle}>Critical Focus</h3>
            <span className={toneClass(criticalFocusDomain?.status || "pending")}>
              {prettyLabel(criticalFocusDomain?.status || "pending")}
            </span>
          </div>
          <div className={styles.miniCardBody}>
            <div className={styles.miniStat}>
              <div className={styles.miniStatLabel}>Domain</div>
              <div className={styles.miniStatValue}>
                {criticalFocusDomain?.domain_label || "n/a"}
              </div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatLabel}>Score</div>
              <div className={styles.miniStatValue}>
                {typeof criticalFocusDomain?.score === "number"
                  ? `${criticalFocusDomain.score.toFixed(2)} / 100`
                  : "n/a"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
          gap: 14,
          marginTop: 18,
        }}
      >
        <div style={sectionBlockStyle}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
            Active Objective
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
            {selectedNodeExecutionLinked
              ? "Stabilize program-linked structural node"
              : "Recover structural visibility and execution readiness"}
          </div>
        </div>

        <div style={sectionBlockStyle}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
            Critical Constraint
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
            {criticalFocusDomain?.domain_label || "n/a"}
          </div>
          <div style={{ marginTop: 8 }}>
            <span className={toneClass(criticalFocusDomain?.status || "pending")}>
              {prettyLabel(criticalFocusDomain?.status || "pending")}
            </span>
          </div>
        </div>

        <div style={sectionBlockStyle}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
            Primary Unlock
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
            {selectedNodeExecutionLinked
              ? "Execution already attached"
              : "Link node to intervention path"}
          </div>
          <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 13 }}>
            {selectedNodeExecutionLinked
              ? "This node is already exposed to the active CRCP program."
              : "This node is still structurally outside the direct execution path."}
          </div>
        </div>

        <div style={sectionBlockStyle}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
            Execution Coverage
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
            {executionProgressPercent}%
          </div>
          <div className={styles.progressTrack} style={{ marginTop: 10 }}>
            <div
              className={styles.progressFill}
              style={{ width: `${executionProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(260px, 0.8fr) minmax(420px, 1.25fr) minmax(340px, 0.75fr)",
          gap: 18,
          marginTop: 18,
        }}
      >
        <div style={sectionBlockStyle}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
            Runtime Repository
            <div
  style={{
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  }}
>
  {[
    ["all", "All"],
    ["critical", "Critical"],
    ["program_linked", "Program Linked"],
    ["uncovered", "Uncovered"],
    ["evidence_poor", "Evidence Poor"],
  ].map(([value, label]) => {
    const active = repoPriorityFilter === value;

    return (
      <button
        key={value}
        type="button"
        onClick={() =>
          setRepoPriorityFilter(
            value as
              | "all"
              | "critical"
              | "program_linked"
              | "uncovered"
              | "evidence_poor"
          )
        }
        style={{
          ...actionButtonBaseStyle,
          padding: "6px 10px",
          fontSize: 12,
          background: active ? "#1e293b" : "#0f172a",
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    );
  })}
</div>
          </div>

          {repoTree ? (
            <div
              style={{
                display: "grid",
                gap: 6,
                maxHeight: 720,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {renderRepoTreeNode(repoTree)}
            </div>
          ) : (
            <div className={styles.empty}>Repository runtime unavailable.</div>
          )}
        </div>

        <div style={{ display: "grid", gap: 18 }}>
  <div style={sectionBlockStyle}>
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
      Priority Signal
    </div>

    <Row label="Priority">
      <span className={toneClass(selectedNodePrioritySignal.priority_label)}>
        {selectedNodePrioritySignal.priority_label}
      </span>
    </Row>

    <Row label="Coverage">
      <span
        className={toneClass(
          selectedNodePrioritySignal.coverage_state === "covered"
            ? "active"
            : "pending"
        )}
      >
        {prettyLabel(selectedNodePrioritySignal.coverage_state)}
      </span>
    </Row>

    <Row label="Structural Urgency">
      <span className={toneClass(selectedNodePrioritySignal.structural_urgency)}>
        {prettyLabel(selectedNodePrioritySignal.structural_urgency)}
      </span>
    </Row>

    <Row label="Cascade Risk">
      <span className={toneClass(selectedNodePrioritySignal.cascade_risk)}>
        {prettyLabel(selectedNodePrioritySignal.cascade_risk)}
      </span>
    </Row>

    <Row label="Operator Command">
      <div style={{ fontWeight: 800, color: "#e2e8f0" }}>
        {selectedNodePrioritySignal.operator_command}
      </div>
    </Row>
  </div>

  <div
    style={{
      ...sectionBlockStyle,
      border: "1px solid #3b82f6",
      boxShadow: "0 0 0 1px rgba(59,130,246,0.15) inset",
    }}
  >
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
      Node Directive
    </div>

    <Row label="Directive">
      <div style={{ fontWeight: 800, color: "#f8fafc", fontSize: 18, lineHeight: 1.3 }}>
        {selectedNodeDirective.directive}
      </div>
    </Row>

    <Row label="Why It Matters">
      <div style={{ color: "#94a3b8" }}>
        {selectedNodeDirective.why_it_matters}
      </div>
    </Row>

    <Row label="Next Move">
      <div style={{ color: "#94a3b8" }}>
        {selectedNodeDirective.next_move}
      </div>
    </Row>
  </div>

  <div style={sectionBlockStyle}>
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
      Selected Node
    </div>

    {selectedRepoNode ? (
      <>
        <Row label="Node">{selectedRepoNode.node_label}</Row>
        <Row label="Type">{prettyLabel(selectedRepoNode.node_type)}</Row>
        <Row label="Status">
          <span className={toneClass(selectedRepoNodeStatus)}>
            {prettyLabel(selectedRepoNodeStatus)}
          </span>
        </Row>
        <Row label="Node ID">{selectedRepoNode.node_id}</Row>
        <Row label="Score">{selectedRepoNodeScore}</Row>
        <Row label="Evidence Count">
          {String(selectedRepoNodeEvidenceCount)}
        </Row>
        <Row label="Dependencies">
          {String(selectedNodeDependencies.length)}
        </Row>
        <Row label="Execution Linked">
          <span
            className={toneClass(
              selectedNodeExecutionLinked ? "active" : "pending"
            )}
          >
            {selectedNodeExecutionLinked ? "Yes" : "No"}
          </span>
        </Row>

        {selectedDomainNode ? (
          <>
            <Row label="Owner Role">
              {selectedDomainNode.owner_role_id || "n/a"}
            </Row>
            <Row label="Summary">
              {selectedDomainNode.summary || "n/a"}
            </Row>
          </>
        ) : null}

        {selectedRoleNode ? (
          <>
            <Row label="Domain">
              {selectedRoleNode.domain_id || "n/a"}
            </Row>
            <Row label="Responsibility">
              {selectedRoleNode.responsibility_summary || "n/a"}
            </Row>
          </>
        ) : null}
      </>
    ) : (
      <div className={styles.empty}>No node selected.</div>
    )}
  </div>

  <div style={sectionBlockStyle}>
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
      Node Reading
    </div>

    <Row label="Summary">{selectedNodeInterpretation.summary}</Row>

    <Row label="Actionability">
      <span className={toneClass(selectedNodeInterpretation.actionability)}>
        {prettyLabel(selectedNodeInterpretation.actionability)}
      </span>
    </Row>

    <Row label="Risk Band">
      <span className={toneClass(selectedNodeRiskBand)}>
        {prettyLabel(selectedNodeRiskBand)}
      </span>
    </Row>

    <Row label="System Type">
      {prettyLabel(selectedNodeSystemType)}
    </Row>

    <Row label="Recommended Reading">
      <div style={{ color: "#94a3b8" }}>
        {selectedNodeInterpretation.recommended_reading}
      </div>
    </Row>
  </div>

  <div style={sectionBlockStyle}>
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
      Node Evidence Preview
    </div>

    {selectedNodeEvidencePreview.length > 0 ? (
      <div style={{ display: "grid", gap: 10 }}>
        {selectedNodeEvidencePreview.map((item) => (
          <div
            key={item.evidence_id}
            style={{
              borderBottom: "1px solid #24324a",
              paddingBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#e2e8f0",
              }}
            >
              {item.label}
            </div>
            <div
              style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}
            >
              {item.evidence_type} ·{" "}
              {item.source_question_id || "no_question_ref"}
            </div>
            <div style={{ marginTop: 6 }}>
              <span className={toneClass(item.status)}>
                {prettyLabel(item.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className={styles.empty}>No evidence preview available.</div>
    )}
  </div>

  <div style={sectionBlockStyle}>
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
      Dependency Reading
    </div>

    <Row label="Immediate Risk">
      <span className={toneClass(selectedRepoNodeStatus)}>
        {selectedRepoNodeStatus === "n/a"
          ? "Unknown"
          : prettyLabel(selectedRepoNodeStatus)}
      </span>
    </Row>

    <Row label="Downstream Exposure">
      <div style={{ color: "#94a3b8" }}>
        {selectedNodeDependencies.length > 0
          ? `${selectedNodeDependencies.length} structural relation(s) currently exposed to this node.`
          : "No visible downstream structural propagation detected."}
      </div>
    </Row>

    <Row label="Upstream Inputs">
      <div style={{ color: "#94a3b8" }}>
        {selectedNodeDependencies.length > 0
          ? "This node is embedded in an active dependency chain."
          : "No upstream dependency chain is currently visible."}
      </div>
    </Row>

    <Row label="Unlock Potential">
      <span
        className={toneClass(
          selectedNodeExecutionLinked || selectedNodeExecutionActions.length > 0
            ? "high"
            : "medium"
        )}
      >
        {selectedNodeExecutionLinked || selectedNodeExecutionActions.length > 0
          ? "High"
          : "Medium"}
      </span>
    </Row>
  </div>

  <div style={sectionBlockStyle}>
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
      Upstream Inputs
    </div>

    {selectedNodeDependencies.filter(
      (edge) => edge.to_node_id === selectedRepoNode?.node_id
    ).length > 0 ? (
      <div style={{ display: "grid", gap: 10 }}>
        {selectedNodeDependencies
          .filter((edge) => edge.to_node_id === selectedRepoNode?.node_id)
          .slice(0, 6)
          .map((edge) => (
            <div
              key={`upstream-${edge.edge_id}`}
              style={{
                borderBottom: "1px solid #24324a",
                paddingBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                {edge.relation}
              </div>
              <div
                style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}
              >
                from: {edge.from_node_id}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                to: {edge.to_node_id}
              </div>
              <div style={{ marginTop: 6 }}>
                <span className={toneClass(edge.status || "planned")}>
                  {prettyLabel(edge.status || "planned")}
                </span>
              </div>
            </div>
          ))}
      </div>
    ) : (
      <div className={styles.empty}>No upstream inputs found.</div>
    )}
  </div>

  <div style={sectionBlockStyle}>
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
      Downstream Exposure
    </div>

    {selectedNodeDependencies.filter(
      (edge) => edge.from_node_id === selectedRepoNode?.node_id
    ).length > 0 ? (
      <div style={{ display: "grid", gap: 10 }}>
        {selectedNodeDependencies
          .filter((edge) => edge.from_node_id === selectedRepoNode?.node_id)
          .slice(0, 6)
          .map((edge) => (
            <div
              key={`downstream-${edge.edge_id}`}
              style={{
                borderBottom: "1px solid #24324a",
                paddingBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                {edge.relation}
              </div>
              <div
                style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}
              >
                from: {edge.from_node_id}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                to: {edge.to_node_id}
              </div>
              <div style={{ marginTop: 6 }}>
                <span className={toneClass(edge.status || "planned")}>
                  {prettyLabel(edge.status || "planned")}
                </span>
              </div>
            </div>
          ))}
      </div>
    ) : (
      <div className={styles.empty}>No downstream exposure found.</div>
    )}
  </div>
</div>

        <div style={{ display: "grid", gap: 18 }}>
          <div style={sectionBlockStyle}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
              Mission Control
            </div>

            <Row label="Selected Node">
              {selectedRepoNode?.node_label || "n/a"}
            </Row>

            <Row label="Execution Exposure">
              <span
                className={toneClass(
                  selectedNodeExecutionLinked ? "active" : "pending"
                )}
              >
                {selectedNodeExecutionLinked ? "Program Linked" : "Outside Path"}
              </span>
            </Row>

            <Row label="Primary Focus">
              {criticalFocusDomain?.domain_label || "n/a"}
            </Row>

            <Row label="Root Stability">
              <span className={toneClass(twinStructure.root.state_label)}>
                {prettyLabel(twinStructure.root.state_label)}
              </span>
            </Row>
            <Row label="Node Severity">
              <span className={toneClass(selectedRepoNodeStatus)}>
                {selectedRepoNodeStatus === "n/a"
                 ? "Unknown"
                 : prettyLabel(selectedRepoNodeStatus)}
              </span>
            </Row>
          </div>

          <div style={sectionBlockStyle}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
              System Reading
            </div>
            <Row label="Root State">
              <span className={toneClass(twinStructure.root.state_label)}>
                {prettyLabel(twinStructure.root.state_label)}
              </span>
            </Row>
            <Row label="Domains">{String(twinStructure.domains.length)}</Row>
            <Row label="Roles">{String(twinStructure.roles.length)}</Row>
            <Row label="Evidence">{String(twinStructure.evidence.length)}</Row>
            <Row label="Dependencies">
              {String(twinStructure.dependencies.length)}
            </Row>
          </div>

          <div style={sectionBlockStyle}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
              Financial Surface
            </div>
            <Row label="Finance Status">
              <span className={toneClass(financeDomainNode?.status || "pending")}>
                {prettyLabel(financeDomainNode?.status || "pending")}
              </span>
            </Row>
            <Row label="Finance Score">
              {typeof financeDomainNode?.score === "number"
                ? `${financeDomainNode.score.toFixed(2)} / 100`
                : "n/a"}
            </Row>
            <Row label="Finance Role">
              {financeRoleNode?.role_label || "n/a"}
            </Row>
            <Row label="Evidence">{String(financeEvidenceCount)}</Row>
          </div>

          <div style={sectionBlockStyle}>
  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
    Intervention Sequence
  </div>

  <Row label="Current Action">
    {selectedNodeSequence.currentAction}
  </Row>

  <Row label="Next Action">
    {selectedNodeSequence.nextAction}
  </Row>

  <Row label="Next Structural Target">
    <div style={{ color: "#94a3b8", wordBreak: "break-word" }}>
      {selectedNodeSequence.nextStructuralTarget}
    </div>
  </Row>

  <Row label="Execution Route">
    <div style={{ color: "#94a3b8" }}>
      {selectedNodeSequence.executionRoute}
    </div>
  </Row>
</div>

<div style={sectionBlockStyle}>
  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
    Consequence Forecast
  </div>

  <Row label="If Ignored">
    <div style={{ color: "#94a3b8" }}>
      {selectedNodeForecast.ifIgnored}
    </div>
  </Row>

  <Row label="If Stabilized">
    <div style={{ color: "#94a3b8" }}>
      {selectedNodeForecast.ifStabilized}
    </div>
  </Row>

  <Row label="Likely Propagation">
    <div style={{ color: "#94a3b8" }}>
      {selectedNodeForecast.propagation}
    </div>
  </Row>

  <Row label="Recommendation">
    <div style={{ color: "#94a3b8" }}>
      {selectedNodeForecast.recommendation}
    </div>
  </Row>
</div>

          <div style={sectionBlockStyle}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
              Execution Surface
            </div>
            <Row label="Program">
              {crcpProgram?.program_label || "n/a"}
            </Row>
            <Row label="Priority">
              <span
                className={toneClass(
                  crcpProgram?.recommended_priority || "planned"
                )}
              >
                {crcpProgram?.recommended_priority || "n/a"}
              </span>
            </Row>
            <Row label="Operational Meaning">
              <div style={{ color: "#94a3b8" }}>
                {selectedNodeExecutionLinked
                  ? "This node is structurally relevant to the currently active CRCP program."
                  : "This node is currently outside the direct execution path."}
              </div>
            </Row>
            <Row label="Phase">
              <span className={toneClass(crcpProgram?.current_phase || "planned")}>
                {prettyLabel(crcpProgram?.current_phase || "planned")}
              </span>
            </Row>
            <Row label="Progress">{executionProgressPercent}%</Row>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className={styles.empty} style={{ marginTop: 14 }}>
      No repository runtime available.
    </div>
  )}
</section>
              </>
            ) : null}
            {crcpProgram ? (
  <section className={`${styles.card} ${styles.fullWidth}`}>
    <h2 className={styles.cardTitle}>
      Block G — CRCP Executable Program
    </h2>
    <div className={styles.meta}>
      system-generated structural intervention program derived from twin state
    </div>

    <div style={{ ...sectionBlockStyle, marginTop: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
        {crcpProgram.program_label}
      </div>

      <div className={styles.chips} style={{ marginBottom: 12 }}>
        <span className={toneClass(crcpProgram.status)}>
          {crcpProgram.status}
        </span>
        <span className={toneClass(crcpProgram.recommended_priority)}>
          {crcpProgram.recommended_priority}
        </span>
        <span className={toneClass(crcpProgram.current_phase)}>
          {crcpProgram.current_phase}
        </span>
      </div>

      <Row label="Target State">
        {prettyLabel(crcpProgram.target_state)}
      </Row>

      <Row label="Target Domains">
       <Chips values={crcpProgram.target_domains.map(prettyLabel)} />
      </Row>

      <Row label="Rationale">
        <div style={{ color: "#94a3b8" }}>
          {crcpProgram.rationale}
        </div>
      </Row>
    </div>

    <Row label="Generated At">
  <div className={styles.mutedMono}>{crcpProgram.generated_at}</div>
</Row>

    <div style={{ marginTop: 18 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
        Program Actions
      </h3>

      {crcpProgram.actions.length > 0 ? (
        <div className={styles.list}>
          {crcpProgram.actions.map((action) => (
            <div key={action.action_id} className={styles.listItem}>
              <Row label="Title">{action.title}</Row>

              <Row label="Domain">
                {prettyLabel(action.domain)}
              </Row>

              <Row label="Phase">
                <span className={toneClass(action.phase)}>
                  {action.phase}
                </span>
              </Row>

              <Row label="Owner Role">
                {prettyLabel(action.owner_role)}
              </Row>

              <Row label="Description">
                {action.description}
              </Row>

              <Row label="Expected Outcome">
                <div style={{ color: "#94a3b8" }}>
                  {action.expected_outcome}
                </div>
              </Row>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          No actions generated.
        </div>
      )}
    </div>
  </section>
) : null}

{crcpProgram ? (
  <section className={`${styles.card} ${styles.fullWidth}`}>
    <h2 className={styles.cardTitle}>
      Block H — CRCP Execution Tracker
    </h2>
    <div className={styles.meta}>
      operational execution surface for the currently activated CRCP program
    </div>

    <div className={styles.miniGrid} style={{ marginTop: 16 }}>
      <div className={styles.miniCard}>
        <div className={styles.miniCardHeader}>
          <h3 className={styles.miniCardTitle}>Program Status</h3>
          <span className={toneClass(programExecutionState)}> 
            {prettyLabel(programExecutionState)} 
          </span>
        </div>
        <div className={styles.miniCardBody}>
          <div className={styles.miniStat}>
            <div className={styles.miniStatLabel}>Current Phase</div>
            <div className={styles.miniStatValue}>
              {prettyLabel(crcpProgram.current_phase)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.miniCard}>
        <div className={styles.miniCardHeader}>
          <h3 className={styles.miniCardTitle}>Tracked Actions</h3>
          <span className={toneClass("active")}>Tracked</span>
        </div>
        <div className={styles.miniCardBody}>
          <div className={styles.miniStat}>
            <div className={styles.miniStatLabel}>Program Units</div>
            <div className={styles.miniStatValue}>
              {executionTrackerItems.length}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.miniCard}>
        <div className={styles.miniCardHeader}>
          <h3 className={styles.miniCardTitle}>Execution Progress</h3>
          <span
            className={toneClass(
              executionProgressPercent >= 100
                ? "complete"
                : executionProgressPercent > 0
                ? "in_progress"
                : "pending"
            )}
          >
            {executionProgressPercent >= 100
              ? "Complete"
              : executionProgressPercent > 0
              ? "In Progress"
              : "Pending"}
          </span>
        </div>
        <div className={styles.miniCardBody}>
          <div className={styles.miniStat}>
            <div className={styles.miniStatLabel}>Progress</div>
            <div className={styles.miniStatValue}>
              {executionProgressPercent}%
            </div>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${executionProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.miniCard}>
        <div className={styles.miniCardHeader}>
          <h3 className={styles.miniCardTitle}>Target Domains</h3>
          <span className={toneClass("active")}>Scope</span>
        </div>
        <div className={styles.miniCardBody}>
          <Chips values={crcpProgram.target_domains.map(prettyLabel)} />
        </div>
      </div>
    </div>

    <div style={{ marginTop: 18 }}>
      {executionTrackerItems.length > 0 ? (
        <div className={styles.list}>
          {executionTrackerItems.map((item, index) => (
            <div key={item.action_id} className={styles.listItem}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
                  Unit {String(index + 1).padStart(2, "0")} — {item.title}
                </div>

                <button
                  type="button"
                  onClick={() => cycleExecutionStatus(item.action_id)}
                  style={{
                    ...actionButtonBaseStyle,
                    padding: "6px 12px",
                    fontSize: 12,
                    background: "#0f172a",
                    cursor: "pointer",
                  }}
                >
                  <span className={toneClass(item.status)}>
                    {prettyLabel(item.status)}
                  </span>
                </button>
              </div>

              <Row label="Action ID">{item.action_id}</Row>

              <Row label="Domain">{prettyLabel(item.domain)}</Row>

              <Row label="Phase">
                <span className={toneClass(item.phase)}>
                  {prettyLabel(item.phase)}
                </span>
              </Row>

              <Row label="Owner Role">{prettyLabel(item.owner_role)}</Row>

              <Row label="Expected Outcome">
                <div style={{ color: "#94a3b8" }}>
                  {item.expected_outcome}
                </div>
              </Row>

              <Row label="Execution Intent">
                <div style={{ color: "#94a3b8" }}>
                  {`Advance ${prettyLabel(item.domain)} through ${prettyLabel(
                    item.phase
                  )} control actions.`}
                </div>
              </Row>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No execution actions available.</div>
      )}
    </div>
  </section>
) : null}



            <section className={`${styles.card} ${styles.fullWidth}`}>
              <h2 className={styles.cardTitle}>Block E — Performance Profile</h2>
              <div className={styles.meta}>
                visual score surface for rapid interpretation
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                  marginTop: 16,
                }}
              >
                {scoreBars.map((item) => (
                  <div key={item.label} style={sectionBlockStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#e2e8f0",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#94a3b8",
                          fontWeight: 700,
                        }}
                      >
                        {item.value.toFixed(2)} / 100
                      </div>
                    </div>

                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${styles.card} ${styles.fullWidth}`}>
              <h2 className={styles.cardTitle}>Block F — Persistence</h2>
              <div className={styles.meta}>
                local canonical persistence result
              </div>

              {result.persisted ? (
                <>
                  <Row label="Intake Path">
                    <div className={styles.mutedMono}>
                      {result.persisted.intake_path}
                    </div>
                  </Row>
                  <Row label="Snapshot Path">
                    <div className={styles.mutedMono}>
                      {result.persisted.snapshot_path}
                    </div>
                  </Row>
                  <Row label="Twin Seed Path">
                    <div className={styles.mutedMono}>
                      {result.persisted.twin_seed_path}
                    </div>
                  </Row>
                </>
              ) : (
                <div className={styles.empty}>
                  No persistence result returned.
                </div>
              )}
            </section>
          </>
        ) : (
          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>Lab Status</h2>
            <div className={styles.meta}>
              Lock Block 0, complete the guided capture, and execute CRCP when
              ready.
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
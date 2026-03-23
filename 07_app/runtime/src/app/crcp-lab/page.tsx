"use client";

import { useEffect, useMemo, useState } from "react";
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

type CrcpRunApiResponse = {
  ok: boolean;
  result: null | {
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

type HeaderSnapshotItem = {
  label: string;
  value: string;
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#182235",
  border: "1px solid #2b3955",
  color: "#e5eefc",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
};

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  opacity: 0.7,
  cursor: "not-allowed",
};

const sectionBlockStyle: React.CSSProperties = {
  background: "#182235",
  border: "1px solid #2b3955",
  borderRadius: 12,
  padding: "14px 16px",
};

const actionButtonBaseStyle: React.CSSProperties = {
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
  children: React.ReactNode;
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
    v === "ready" ||
    v === "positive" ||
    v === "answered" ||
    v === "medium" ||
    v === "valid" ||
    v === "unlocked" ||
    v === "planned"
  ) {
    return `${styles.status} ${styles.statusActive}`;
  }

  return styles.status;
}

function questionToneClass(direction?: string): string {
  return toneClass(direction);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12);
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

function FieldShell({
  label,
  children,
  helper,
}: {
  label: string;
  children: React.ReactNode;
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

export default function CrcpLabPage() {
  const [mounted, setMounted] = useState(false);
  const [orgSeed, setOrgSeed] = useState("");
  const [metadata, setMetadata] = useState<MetadataState>(INITIAL_METADATA);
  const [answers, setAnswers] = useState<AnswerMap>(INITIAL_ANSWER_MAP);
  const [isHeaderLocked, setIsHeaderLocked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CrcpRunApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [questionCatalog, setQuestionCatalog] =
    useState<CrcpQuestionsApiResponse["result"]>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
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

  const result = response?.result ?? null;
  const backendValidationIssues = result?.validation_issues ?? [];
  const scoreBars = useMemo(() => (result ? getScoreBars(result) : []), [result]);
  const twinSeedV2 = result?.twin_seed_v2 ?? null;
  const twinStructure = result?.twin_structure ?? null;
  const twinVectorBars = useMemo(
    () => (twinSeedV2 ? getTwinVectorBars(twinSeedV2) : []),
    [twinSeedV2]
  );

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

          <div style={{ fontSize: 12, color: "#94a3b8", alignSelf: "center" }}>
            {isHeaderLocked
              ? "Capture header locked. You can now answer the questionnaire."
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
                      className={questionToneClass(
                        currentQuestion.scoring_direction
                      )}
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
                  <h2 className={styles.cardTitle}>
                    Block D15 — Repository View
                  </h2>
                  <div className={styles.meta}>
                    business rendered as structural repository
                  </div>

                  <div
                    style={{
                      ...sectionBlockStyle,
                      marginTop: 16,
                      overflowX: "auto",
                    }}
                  >
                    <div
                      style={{
                        minWidth: 980,
                        display: "grid",
                        gap: 8,
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        fontSize: 13,
                        color: "#cbd5e1",
                      }}
                    >
                      <div>/{slugify(twinStructure.root.display_name || "company")}</div>
                      <div>├── root/</div>
                      <div>│   ├── entity_id.ts</div>
                      <div>│   ├── identity.ts</div>
                      <div>│   └── lifecycle.ts</div>
                      <div>├── domains/</div>
                      {twinStructure.domains.map((domain, index) => (
                        <div key={domain.domain_id}>
                          {index === twinStructure.domains.length - 1
                            ? `│   └── ${domain.domain_name}.node.ts`
                            : `│   ├── ${domain.domain_name}.node.ts`}
                        </div>
                      ))}
                      <div>├── roles/</div>
                      {twinStructure.roles.map((role, index) => (
                        <div key={role.role_id}>
                          {index === twinStructure.roles.length - 1
                            ? `│   └── ${role.role_name}.role.ts`
                            : `│   ├── ${role.role_name}.role.ts`}
                        </div>
                      ))}
                      <div>├── evidence/</div>
                      <div>│   └── evidence.index.ts</div>
                      <div>├── activation/</div>
                      <div>│   └── activation.layer.ts</div>
                      <div>└── simulation/</div>
                      <div>    └── simulation.layer.ts</div>
                    </div>
                  </div>
                </section>
              </>
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
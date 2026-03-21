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

const COUNTRY_OPTIONS: Record<
  string,
  { label: string; cities: string[] }
> = {
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
    v === "low"
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
    v === "unlocked"
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
  if (typeof value === "boolean") {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

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
    issues.push(`country "${metadata.country}" is not part of the supported set.`);
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
  if (value === undefined) {
    return "not_answered";
  }

  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value.trim() || "not_answered";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "not_answered";
  }

  return "not_answered";
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
    .map((questionId) => questions.find((question) => question.question_id === questionId))
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

function getScoreBars(result: NonNullable<CrcpRunApiResponse["result"]>): ScoreBarItem[] {
  if (!result.scores) {
    return [];
  }

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

    return buildOrganizationId(metadata.business_name, metadata.sector, orgSeed);
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

  const headerSnapshot = useMemo(
    () => getHeaderSnapshot(metadata),
    [metadata]
  );

  const result = response?.result ?? null;
  const backendValidationIssues = result?.validation_issues ?? [];
  const scoreBars = useMemo(() => (result ? getScoreBars(result) : []), [result]);

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
                  localValidationIssues.length > 0 ? "not-allowed" : "pointer",
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
                        isAnswered(currentQuestionValue) ? "answered" : "pending"
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
                <span className={toneClass(isCaptureComplete ? "ready" : "pending")}>
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
                <span className={toneClass(localValidationIssues.length === 0 && isHeaderLocked ? "valid" : "pending")}>
                  {localValidationIssues.length === 0 && isHeaderLocked ? "valid" : "blocked"}
                </span>
              </div>
              <div className={styles.miniCardBody}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatLabel}>Organization ID</div>
                  <div className={styles.miniStatValue}>{organizationId || "n/a"}</div>
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
                <span className={toneClass(isRunDisabled ? "pending" : "unlocked")}>
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
                  Use the execution gate only after confirming the final responses.
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

            <section className={`${styles.card} ${styles.fullWidth}`}>
              <h2 className={styles.cardTitle}>
                Block E — Performance Profile
              </h2>
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
              Lock Block 0, complete the guided capture, and execute CRCP when ready.
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
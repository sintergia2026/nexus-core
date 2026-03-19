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

type FormState = {
  organization_id: string;
  sector: string;
  subsector: string;
  country: string;

  business_name: string;
  has_standardized_processes: string;
  operational_breakdowns: number;
  delays_frequency: number;

  roles_defined: string;
  dependency_on_key_people: number;

  data_accuracy: number;
  single_source_of_truth: string;

  financial_stress: number;
  knows_margins: string;

  revenue_predictability: number;
  discount_pressure: number;

  customer_handoff_friction: number;
  complaints_tracked: string;

  regular_planning: string;
  reactive_changes: number;
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

const INITIAL_FORM: FormState = {
  organization_id: "org-sintergia-demo",
  sector: "restaurant",
  subsector: "casual_dining",
  country: "CO",

  business_name: "Demo Restaurant",
  has_standardized_processes: "yes",
  operational_breakdowns: 3,
  delays_frequency: 4,

  roles_defined: "yes",
  dependency_on_key_people: 4,

  data_accuracy: 2,
  single_source_of_truth: "no",

  financial_stress: 4,
  knows_margins: "yes",

  revenue_predictability: 3,
  discount_pressure: 4,

  customer_handoff_friction: 4,
  complaints_tracked: "yes",

  regular_planning: "no",
  reactive_changes: 4,
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

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function toneClass(value?: string): string {
  const v = String(value ?? "").toLowerCase();

  if (v === "critical" || v === "p1" || v === "stabilize_now") {
    return `${styles.status} ${styles.statusSuperseded}`;
  }

  if (v === "active" || v === "stable" || v === "high") {
    return `${styles.status} ${styles.statusActive}`;
  }

  return styles.status;
}

function questionToneClass(direction?: string): string {
  const v = String(direction ?? "").toLowerCase();

  if (v === "negative") {
    return `${styles.status} ${styles.statusSuperseded}`;
  }

  if (v === "positive") {
    return `${styles.status} ${styles.statusActive}`;
  }

  return styles.status;
}

function buildAnswers(form: FormState): CrcpAnswer[] {
  return [
    { question_id: "ID_01", section: "identity", value: form.business_name },
    { question_id: "ID_02", section: "identity", value: [form.sector] },

    {
      question_id: "OPS_01",
      section: "operations",
      value: form.has_standardized_processes,
    },
    {
      question_id: "OPS_02",
      section: "operations",
      value: Number(form.operational_breakdowns),
    },
    {
      question_id: "OPS_06",
      section: "operations",
      value: Number(form.delays_frequency),
    },

    {
      question_id: "STF_01",
      section: "staffing",
      value: form.roles_defined === "yes",
    },
    {
      question_id: "STF_06",
      section: "staffing",
      value: Number(form.dependency_on_key_people),
    },

    {
      question_id: "REP_02",
      section: "reporting",
      value: Number(form.data_accuracy),
    },
    {
      question_id: "REP_06",
      section: "reporting",
      value: form.single_source_of_truth,
    },

    {
      question_id: "FIN_02",
      section: "finance",
      value: Number(form.financial_stress),
    },
    {
      question_id: "FIN_03",
      section: "finance",
      value: form.knows_margins,
    },

    {
      question_id: "SAL_02",
      section: "sales",
      value: Number(form.revenue_predictability),
    },
    {
      question_id: "SAL_07",
      section: "sales",
      value: Number(form.discount_pressure),
    },

    {
      question_id: "CF_04",
      section: "customer_flow",
      value: Number(form.customer_handoff_friction),
    },
    {
      question_id: "CF_05",
      section: "customer_flow",
      value: form.complaints_tracked,
    },

    {
      question_id: "PLN_01",
      section: "planning",
      value: form.regular_planning,
    },
    {
      question_id: "PLN_04",
      section: "planning",
      value: Number(form.reactive_changes),
    },
  ];
}

function buildPreviewPayload(form: FormState) {
  return {
    context: {
      organization_id: form.organization_id,
      sector: form.sector,
      subsector: form.subsector,
      country: form.country,
    },
    answers: buildAnswers(form),
    captured_at: "__CLIENT_RUNTIME__",
  };
}

function buildRuntimePayload(form: FormState) {
  return {
    context: {
      organization_id: form.organization_id,
      sector: form.sector,
      subsector: form.subsector,
      country: form.country,
    },
    answers: buildAnswers(form),
    captured_at: new Date().toISOString(),
  };
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div className={styles.contextLabel}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#182235",
  border: "1px solid #2b3955",
  color: "#e5eefc",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
};

function getLocalValidationIssues(form: FormState): string[] {
  const issues: string[] = [];
  const subsectors = SUBSECTOR_OPTIONS[form.sector] ?? [];

  if (!form.organization_id.trim()) {
    issues.push("organization_id is required.");
  }

  if (!form.sector.trim()) {
    issues.push("sector is required.");
  }

  if (!form.subsector.trim()) {
    issues.push("subsector is required.");
  } else if (!subsectors.includes(form.subsector)) {
    issues.push(
      `subsector "${form.subsector}" is not valid for sector "${form.sector}".`
    );
  }

  if (!form.country.trim()) {
    issues.push("country is required.");
  }

  if (!form.business_name.trim()) {
    issues.push("business name is required.");
  }

  const scaleFields: Array<[string, number]> = [
    ["operational_breakdowns", form.operational_breakdowns],
    ["delays_frequency", form.delays_frequency],
    ["dependency_on_key_people", form.dependency_on_key_people],
    ["data_accuracy", form.data_accuracy],
    ["financial_stress", form.financial_stress],
    ["revenue_predictability", form.revenue_predictability],
    ["discount_pressure", form.discount_pressure],
    ["customer_handoff_friction", form.customer_handoff_friction],
    ["reactive_changes", form.reactive_changes],
  ];

  for (const [field, value] of scaleFields) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      issues.push(`${field} must be an integer between 1 and 5.`);
    }
  }

  return issues;
}

export default function CrcpLabPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CrcpRunApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [questionCatalog, setQuestionCatalog] =
    useState<CrcpQuestionsApiResponse["result"]>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const payloadPreview = useMemo(() => buildPreviewPayload(form), [form]);
  const localValidationIssues = useMemo(
    () => getLocalValidationIssues(form),
    [form]
  );
  const availableSubsectors = useMemo(
    () => SUBSECTOR_OPTIONS[form.sector] ?? [],
    [form.sector]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      try {
        setQuestionsLoading(true);
        setQuestionsError(null);

        const res = await fetch(
          `/api/internal/crcp/questions?sector=${encodeURIComponent(form.sector)}`,
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
  }, [form.sector]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "sector") {
        const sectorValue = String(value);
        const nextSubsectors = SUBSECTOR_OPTIONS[sectorValue] ?? [];
        next.subsector = nextSubsectors[0] ?? "";
      }

      return next;
    });
  }

  async function handleRun(): Promise<void> {
    if (localValidationIssues.length > 0) {
      setError(
        "Local validation failed. Resolve the issues before running CRCP."
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
        body: JSON.stringify(buildRuntimePayload(form)),
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

  const result = response?.result ?? null;
  const backendValidationIssues = result?.validation_issues ?? [];
  const isRunDisabled = loading || localValidationIssues.length > 0;

  return (
    <AppShell
      title="NEXUS™ CRCP Lab"
      subtitle="Internal interactive surface for the canonical Client Reality Capture Protocol pipeline."
    >
      <section className={styles.contextBar}>
        <div className={styles.contextTitle}>CRCP Lab Control Surface</div>

        <div className={styles.contextGrid}>
          <div className={styles.contextItem}>
            <div className={styles.contextLabel}>Mode</div>
            <div>Interactive pipeline execution</div>
          </div>
          <div className={styles.contextItem}>
            <div className={styles.contextLabel}>Payload</div>
            <div>Editable internal intake</div>
          </div>
          <div className={styles.contextItem}>
            <div className={styles.contextLabel}>Persistence</div>
            <div>Enabled via API route</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <button
            onClick={handleRun}
            disabled={isRunDisabled}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #334155",
              background: isRunDisabled ? "#0f172a" : "#1e293b",
              color: "#e2e8f0",
              cursor: isRunDisabled ? "not-allowed" : "pointer",
              fontWeight: 700,
              opacity: isRunDisabled ? 0.7 : 1,
            }}
          >
            {loading ? "Running CRCP..." : "Run CRCP"}
          </button>
        </div>
      </section>

      <div className={styles.grid}>
        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Block 0 — Interactive Intake</h2>
          <div className={styles.meta}>editable input surface</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
              marginTop: 16,
            }}
          >
            <FieldShell label="Organization ID">
              <input
                style={inputStyle}
                value={form.organization_id}
                onChange={(e) => update("organization_id", e.target.value)}
              />
            </FieldShell>

            <FieldShell label="Sector">
              <select
                style={inputStyle}
                value={form.sector}
                onChange={(e) => update("sector", e.target.value)}
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
                style={inputStyle}
                value={form.subsector}
                onChange={(e) => update("subsector", e.target.value)}
              >
                {availableSubsectors.map((subsector) => (
                  <option key={subsector} value={subsector}>
                    {subsector}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label="Country">
              <input
                style={inputStyle}
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              />
            </FieldShell>

            <FieldShell label="Business Name">
              <input
                style={inputStyle}
                value={form.business_name}
                onChange={(e) => update("business_name", e.target.value)}
              />
            </FieldShell>

            <FieldShell label="Standardized Processes">
              <select
                style={inputStyle}
                value={form.has_standardized_processes}
                onChange={(e) =>
                  update("has_standardized_processes", e.target.value)
                }
              >
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </FieldShell>

            <FieldShell label="Operational Breakdowns (1-5)">
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={5}
                value={form.operational_breakdowns}
                onChange={(e) =>
                  update("operational_breakdowns", Number(e.target.value))
                }
              />
            </FieldShell>

            <FieldShell label="Delays Frequency (1-5)">
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={5}
                value={form.delays_frequency}
                onChange={(e) =>
                  update("delays_frequency", Number(e.target.value))
                }
              />
            </FieldShell>

            <FieldShell label="Roles Clearly Defined">
              <select
                style={inputStyle}
                value={form.roles_defined}
                onChange={(e) => update("roles_defined", e.target.value)}
              >
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </FieldShell>

            <FieldShell label="Dependency On Key People (1-5)">
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={5}
                value={form.dependency_on_key_people}
                onChange={(e) =>
                  update("dependency_on_key_people", Number(e.target.value))
                }
              />
            </FieldShell>

            <FieldShell label="Data Accuracy (1-5)">
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={5}
                value={form.data_accuracy}
                onChange={(e) => update("data_accuracy", Number(e.target.value))}
              />
            </FieldShell>

            <FieldShell label="Single Source Of Truth">
              <select
                style={inputStyle}
                value={form.single_source_of_truth}
                onChange={(e) =>
                  update("single_source_of_truth", e.target.value)
                }
              >
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </FieldShell>

            <FieldShell label="Financial Stress (1-5)">
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={5}
                value={form.financial_stress}
                onChange={(e) =>
                  update("financial_stress", Number(e.target.value))
                }
              />
            </FieldShell>

            <FieldShell label="Knows Margins">
              <select
                style={inputStyle}
                value={form.knows_margins}
                onChange={(e) => update("knows_margins", e.target.value)}
              >
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </FieldShell>

            <FieldShell label="Revenue Predictability (1-5)">
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={5}
                value={form.revenue_predictability}
                onChange={(e) =>
                  update("revenue_predictability", Number(e.target.value))
                }
              />
            </FieldShell>

            <FieldShell label="Discount Pressure (1-5)">
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={5}
                value={form.discount_pressure}
                onChange={(e) =>
                  update("discount_pressure", Number(e.target.value))
                }
              />
            </FieldShell>

            <FieldShell label="Customer Handoff Friction (1-5)">
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={5}
                value={form.customer_handoff_friction}
                onChange={(e) =>
                  update("customer_handoff_friction", Number(e.target.value))
                }
              />
            </FieldShell>

            <FieldShell label="Complaints Tracked">
              <select
                style={inputStyle}
                value={form.complaints_tracked}
                onChange={(e) => update("complaints_tracked", e.target.value)}
              >
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </FieldShell>

            <FieldShell label="Regular Planning">
              <select
                style={inputStyle}
                value={form.regular_planning}
                onChange={(e) => update("regular_planning", e.target.value)}
              >
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </FieldShell>

            <FieldShell label="Reactive Changes (1-5)">
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={5}
                value={form.reactive_changes}
                onChange={(e) =>
                  update("reactive_changes", Number(e.target.value))
                }
              />
            </FieldShell>
          </div>
        </section>

        {localValidationIssues.length > 0 ? (
          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>Block 0A — Local Validation</h2>
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
          <h2 className={styles.cardTitle}>Block 0B — Payload Preview</h2>
          <div className={styles.meta}>exact payload sent to CRCP API</div>
          <pre className={styles.mono} style={{ whiteSpace: "pre-wrap" }}>
            {prettyJson(payloadPreview)}
          </pre>
        </section>

        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Block 1 — Question Catalog</h2>
          <div className={styles.meta}>
            canonical question selection resolved by sector
          </div>

          {questionsLoading ? (
            <div className={styles.meta} style={{ marginTop: 12 }}>
              Loading canonical questions...
            </div>
          ) : questionsError ? (
            <div className={styles.error} style={{ marginTop: 12 }}>
              {questionsError}
            </div>
          ) : questionCatalog ? (
            <>
              <div style={{ marginTop: 14 }}>
                <Row label="Sector">{questionCatalog.sector}</Row>
                <Row label="Question Count">
                  {String(questionCatalog.questionCount)}
                </Row>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 16,
                  marginTop: 18,
                }}
              >
                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>Identity Questions</h2>
                  <div className={styles.meta}>
                    canonical identity layer for the selected sector
                  </div>

                  <div className={styles.list} style={{ marginTop: 14 }}>
                    {questionCatalog.identityQuestions.map((question) => (
                      <div key={question.question_id} className={styles.listItem}>
                        <Row label="Question ID">{question.question_id}</Row>
                        <Row label="Text">{question.text}</Row>
                        <Row label="Domain">{question.domain}</Row>
                        <Row label="Type">{question.type}</Row>
                        <Row label="Weight">{String(question.weight)}</Row>
                        <Row label="Direction">
                          <span
                            className={questionToneClass(
                              question.scoring_direction
                            )}
                          >
                            {question.scoring_direction || "neutral"}
                          </span>
                        </Row>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>Adaptive Questions</h2>
                  <div className={styles.meta}>
                    sector-aware and cross-sector diagnostic extensions
                  </div>

                  <div className={styles.list} style={{ marginTop: 14 }}>
                    {questionCatalog.adaptiveQuestions.map((question) => (
                      <div key={question.question_id} className={styles.listItem}>
                        <Row label="Question ID">{question.question_id}</Row>
                        <Row label="Text">{question.text}</Row>
                        <Row label="Domain">{question.domain}</Row>
                        <Row label="Type">{question.type}</Row>
                        <Row label="Weight">{String(question.weight)}</Row>
                        <Row label="Direction">
                          <span
                            className={questionToneClass(
                              question.scoring_direction
                            )}
                          >
                            {question.scoring_direction || "neutral"}
                          </span>
                        </Row>
                        <Row label="Applicable Sectors">
                          <Chips
                            values={
                              question.applicable_sectors.length > 0
                                ? question.applicable_sectors
                                : ["cross_sector"]
                            }
                          />
                        </Row>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className={styles.empty} style={{ marginTop: 12 }}>
              No question catalog loaded.
            </div>
          )}
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
              Block 0C — Backend Validation Issues
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
                {String(result.scores.operational_maturity)}
              </Row>
              <Row label="Financial Pressure">
                {String(result.scores.financial_pressure)}
              </Row>
              <Row label="Reporting Reliability">
                {String(result.scores.reporting_reliability)}
              </Row>
              <Row label="Structural Risk">
                {String(result.scores.structural_risk)}
              </Row>
              <Row label="Commercial Strength">
                {String(result.scores.commercial_strength)}
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
              <h2 className={styles.cardTitle}>Block E — Persistence</h2>
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

            <section className={`${styles.card} ${styles.fullWidth}`}>
              <h2 className={styles.cardTitle}>Block F — Raw Response Envelope</h2>
              <div className={styles.meta}>inspection / debugging surface</div>
              <pre className={styles.mono} style={{ whiteSpace: "pre-wrap" }}>
                {prettyJson(response)}
              </pre>
            </section>
          </>
        ) : (
          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>Lab Status</h2>
            <div className={styles.meta}>
              Edit the intake and run CRCP to inspect the live pipeline.
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
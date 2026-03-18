# CRCP — DECISION PRINCIPLE
# CANONICAL DECISION LOGIC

Status: DRAFT → CANDIDATE  
Owner: SINTERGIA / NEXUS CORE  
Layer: Engine / Decision System

---

## I. PURPOSE

The CRCP Decision Engine exists to translate baseline scores into actionable system states.

The goal is not to generate recommendations.

The goal is to classify structural readiness and define intervention priority.

---

## II. INPUT

The decision engine consumes:

- CrcpBaselineScores

Scores include:

- operational_maturity
- financial_pressure
- reporting_reliability
- structural_risk
- commercial_strength

All scores must be normalized (0–100).

---

## III. OUTPUT

The decision engine must produce:

CrcpDecision:
- decision_label
- priority
- readiness_level

---

## IV. DECISION PHILOSOPHY

The decision is not a suggestion.

The decision is a structural classification.

It must be:

- deterministic
- auditable
- explainable
- consistent across sectors

---

## V. DECISION DIMENSIONS

The decision must consider:

1. Reporting reliability (visibility)
2. Structural risk (instability)
3. Operational maturity (execution capability)
4. Financial pressure (survival risk)
5. Commercial strength (growth capacity)

---

## VI. CORE LOGIC

Example logic (Phase 1 simplified):

IF reporting_reliability < 40:
    decision_label = "stabilize_now"
    priority = "P1"
    readiness_level = "low"

ELSE IF structural_risk > 70:
    decision_label = "contain_risk"
    priority = "P1"
    readiness_level = "low"

ELSE IF operational_maturity < 50:
    decision_label = "standardize_operations"
    priority = "P2"
    readiness_level = "medium"

ELSE:
    decision_label = "optimize_growth"
    priority = "P3"
    readiness_level = "high"

---

## VII. DECISION LABELS

Decision labels must be defined in contracts.

Examples:

- stabilize_now
- contain_risk
- standardize_operations
- optimize_growth

No hardcoded labels in frontend.

---

## VIII. PRIORITY SYSTEM

Priority levels:

- P1 → critical intervention
- P2 → structural improvement
- P3 → optimization

---

## IX. READINESS LEVEL

Readiness is not subjective.

It is derived from score aggregation.

Levels:

- low
- medium
- high

---

## X. CONSTRAINTS

The decision engine must NOT:

- depend on UI
- use random logic
- produce non-reproducible outputs
- embed natural language reasoning
- bypass scoring layer

---

## XI. SUCCESS CRITERIA

The decision system is valid if:

- same input → same decision
- different sectors → comparable outcomes
- decision can be explained from scores
- decision can be versioned

---

## XII. FUTURE EXTENSIONS (NOT PHASE 1)

Deferred:

- multi-stage decisions
- recommendation engines
- AI-assisted interpretation
- dynamic thresholds
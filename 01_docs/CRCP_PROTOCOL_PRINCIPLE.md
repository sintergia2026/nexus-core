# CRCP — CLIENT REALITY CAPTURE PROTOCOL
# PROTOCOL PRINCIPLE (CANONICAL)

Status: DRAFT → CANDIDATE  
Owner: SINTERGIA / NEXUS CORE  
Layer: Intake / Domain Entry  
Scope: Phase 1 (Foundational Capture)

---

## I. DECLARATION OF INTENT

CRCP must not be implemented as a frontend wizard or survey.

CRCP is a canonical intake protocol designed to capture institutional reality and translate it into a structured, interpretable, and auditable baseline state.

The UI is not the system.

The truth of CRCP must live in:
- contracts
- ontology
- engine
- twin
- diagnostic outputs

CRCP exists to convert business responses into structural intelligence.

---

## II. DEFINITION

CRCP = Client Reality Capture Protocol

CRCP is the foundational intake layer of NEXUS™, responsible for capturing the minimum viable reality of a client organization and translating it into a structured baseline suitable for system interpretation.

CRCP is not a questionnaire.

CRCP is a protocol.

---

## III. CORE FUNCTION

CRCP Phase 1 must:

1. Capture identity of the business (fixed)
2. Capture sectoral context
3. Capture operational friction
4. Capture role dependency
5. Capture commercial maturity
6. Capture operational discipline
7. Capture financial pressure
8. Capture reporting reliability

CRCP must produce a structural baseline, not a narrative summary.

---

## IV. INPUT STRUCTURE

CRCP intake is composed of:

- 8 fixed identity questions (cross-sector)
- 42 adaptive questions (sector-driven)

Total questions per execution: 50

The adaptive questions must be selected from a canonical bank (~100 questions) using sector-based selection logic.

---

## V. OUTPUT REQUIREMENTS (MANDATORY)

CRCP must produce the following outputs:

- CrcpIntakePayload
- CrcpNormalizedPayload
- CrcpBaselineScores
- CrcpDecision
- CrcpDiagnosticSnapshot
- CrcpTwinSeed

CRCP must not terminate in a score alone.

---

## VI. THE TWIN SEED PRINCIPLE

The primary output of CRCP is the Twin Seed.

The Twin Seed represents the initial structural state of the organization and serves as the foundation for:

- digital twin construction
- future operational tracking
- system evolution

CRCP without Twin Seed is incomplete.

---

## VII. ARCHITECTURAL SEPARATION

CRCP must be implemented across layers:

Contracts:
- question types
- answer types
- decision labels
- sector profiles

Engine:
- normalization
- scoring
- decision
- snapshot builder
- twin seed builder

Twin:
- CRCP model
- twin initialization

App:
- capture interface only
- no business logic

---

## VIII. NON-NEGOTIABLE CONSTRAINTS

CRCP must NOT:

- embed scoring logic in frontend
- mix rendering with interpretation
- store questions as unstructured text
- produce opaque scoring
- act as a quiz or survey
- end without snapshot persistence
- end without twin seed

---

## IX. PHASE 1 SCOPE

Included:
- identity capture
- baseline scoring
- decision labeling
- diagnostic snapshot
- twin seed generation

Excluded (deferred):
- advanced recommendations
- predictive modeling
- multi-period tracking
- automated optimization loops

---

## X. SUCCESS CRITERIA

CRCP is successful if:

- it produces a consistent structural baseline
- it is auditable
- it is sector-adaptable
- it seeds the twin correctly
- it supports future comparability across clients

---

## XI. FAILURE MODES

CRCP fails if:

- it behaves like a form
- it cannot explain its scoring
- it cannot persist state
- it cannot seed a twin
- it is tightly coupled to UI
# CRCP — SECTOR ADAPTATION PRINCIPLE
# CANONICAL STRUCTURE FOR SECTOR VARIATION

Status: DRAFT → CANDIDATE  
Owner: SINTERGIA / NEXUS CORE  
Layer: Contracts / Engine

---

## I. PURPOSE

CRCP must adapt to sector-specific realities without breaking structural comparability across clients.

The objective is to:

- capture relevant data per sector
- maintain a common analytical baseline
- ensure cross-client comparability

CRCP must not become fragmented per sector.

---

## II. CORE PRINCIPLE

All sectors share the same structural dimensions.

Sector adaptation must occur at the **question selection layer**, not at the scoring or output layer.

---

## III. SHARED STRUCTURAL DOMAINS

All CRCP executions must map to the same core domains:

- operations
- staffing
- reporting
- finance
- sales
- customer_flow
- inventory (optional per sector)
- planning

These domains must remain constant across all sectors.

---

## IV. QUESTION ARCHITECTURE

CRCP question system is composed of:

1. Identity questions (fixed, cross-sector)
2. Cross-sector diagnostic questions
3. Sector-specific diagnostic questions

Total:
- 8 identity questions
- 42 adaptive questions

---

## V. QUESTION BANK

A canonical question bank (~100 questions) must exist.

Each question must include:

- question_id
- domain
- type
- weight
- cross_sector (true/false)
- applicable_sectors (if not cross-sector)

Questions must not be stored as raw text only.

They must be structured entities.

---

## VI. SECTOR PROFILES

Each sector must define:

- domain priority
- question distribution
- sector-specific overrides

Example:

restaurant:
- high priority: operations, staffing, inventory, customer_flow
- medium priority: reporting, finance
- low priority: planning

---

## VII. SELECTION LOGIC

The CRCP engine must:

1. Load question bank
2. Filter cross-sector questions
3. Add sector-specific questions
4. Apply domain priority weighting
5. Select exactly 42 questions

The selection must be:

- deterministic
- reproducible
- auditable

---

## VIII. COMPARABILITY GUARANTEE

CRCP must guarantee that:

- all outputs map to the same score structure
- sectors differ in input, not in output schema
- scores are always comparable across clients

---

## IX. WHAT MUST NOT CHANGE PER SECTOR

The following must remain identical across sectors:

- scoring structure
- decision logic
- output types
- twin seed structure

---

## X. WHAT CAN CHANGE PER SECTOR

The following can vary:

- question selection
- wording
- domain emphasis
- weight distribution

---

## XI. FAILURE MODES

Sector adaptation fails if:

- sectors produce non-comparable outputs
- scoring logic differs per sector
- questions are hardcoded in UI
- selection is random or inconsistent

---

## XII. PHASE 1 SCOPE

Included:
- 6–8 sectors defined
- basic question distribution
- deterministic selection

Deferred:
- deep subsector specialization
- dynamic learning-based selection
- adaptive weighting based on historical data
# PHASE 2 ALLOWED EXTENSION RULES

Allowed extension rules for the canonical output objects of the NEXUS™ diagnostic core.

---

## 1. Purpose

This document defines how the canonical output objects of the NEXUS™ diagnostic core may evolve in future phases without silently mutating their current semantic identity.

Its purpose is to protect the system against a common architectural failure:

- keeping object names the same
- while changing what those objects really mean

This document exists so future growth can happen without semantic drift.

---

## 2. Core Principle

An output object may grow without losing identity only if new fields extend the object without redefining its current role.

This means future extensions are allowed only when they are:

- additive
- semantically consistent
- backward-compatible in role
- non-destructive to current referential integrity
- non-destructive to current truth/projection boundaries

The object may become richer.  
It must not become a different object under the same name.

---

## 3. Canonical Objects Covered

These rules apply to the current canonical output objects:

1. normalized payload
2. metric
3. signal
4. twin state
5. diagnostic snapshot
6. weekly report

---

## 4. Extension Categories

Future extensions should be understood in four categories.

### 4.1 Allowed Additive Extension

A new field is added while preserving the current role of the object.

Example:

- adding optional metadata to the snapshot
- adding non-breaking audit notes to the report
- adding optional grouping metadata to a bundle-oriented output

This is allowed if semantics remain intact.

### 4.2 Allowed Nested Enrichment

A nested structure becomes richer while preserving current minimum fields and current meaning.

Example:

- extending `decisionOutput` with future rationale metadata
- enriching `normalizationMeta` with more detailed provenance diagnostics

This is allowed if current required fields remain present and meaning stays consistent.

### 4.3 Controlled Optional Projection Extension

A projection object gains new optional delivery-facing fields without becoming a truth object.

Example:

- adding delivery channel metadata to the weekly report
- adding report classification metadata
- adding display-oriented grouping hints

This is allowed only if the report remains downstream of the snapshot and does not become a source of truth.

### 4.4 Forbidden Semantic Mutation

An object keeps its name but changes its real architectural role.

Example:

- using the weekly report as a primary truth object
- turning the twin into a UI summary object
- treating metrics as decorative labels instead of canonical computed values

This is not allowed.

---

## 5. Object-Specific Allowed Extensions

## 5.1 Normalized Payload

Allowed future extensions:

- richer normalization metadata
- ingestion provenance metadata
- validation diagnostics
- optional source handling details
- optional audit notes

Not allowed:

- turning it into a presentation object
- removing current normalized business fields
- bypassing it as the internal truth input layer
- letting raw intake become equivalent to normalized intake

The normalized payload must remain the internal truth-ready input object.

---

## 5.2 Metric

Allowed future extensions:

- optional metric rationale metadata
- optional calibration version reference
- optional metric grouping tags
- optional interpretation hints for future downstream layers

Not allowed:

- renaming metric identity away from `code`
- replacing computed metrics with narrative labels
- removing provenance linkage
- using metric objects as report sections

A metric must remain a computed diagnostic object.

---

## 5.3 Signal

Allowed future extensions:

- optional interpretation rationale
- optional threshold metadata
- optional calibration reference
- optional ontology linkage for future model expansion

Not allowed:

- removing `active` semantics
- redefining severity into display-only language
- treating signals as cosmetic badges
- disconnecting signals from metric context

Signals must remain interpretive objects between metrics and state.

---

## 5.4 Twin State

Allowed future extensions:

- optional governance-ready metadata
- optional state rationale
- optional comparative references
- optional future lineage hooks
- optional phase-specific annotations

Not allowed:

- turning the twin into a report surrogate
- making the twin presentation-first
- removing decision output linkage
- weakening identity structure
- changing the twin into a frontend state container

The twin must remain the canonical operational truth object.

---

## 5.5 Diagnostic Snapshot

Allowed future extensions:

- optional bundle metadata
- optional archival metadata
- optional validation summary metadata
- optional immutable audit annotations
- optional integrity verification metadata

Not allowed:

- turning the snapshot into an editable working object
- dropping payload lineage
- weakening replay value
- using it as an informal export without canonical evidence role

The snapshot must remain the frozen evidence object of a diagnostic run.

---

## 5.6 Weekly Report

Allowed future extensions:

- optional delivery metadata
- optional presentation grouping metadata
- optional audience-specific summary fields
- optional distribution-state metadata
- optional bundle linkage metadata

Not allowed:

- promoting the report to truth source
- letting report language contradict snapshot meaning
- replacing linked snapshot dependency with free-floating prose
- turning the report into the canonical state object

The weekly report must remain a projection object.

---

## 6. Frozen Semantic Boundaries

The following semantic boundaries must remain frozen unless a formal redesign is explicitly approved.

### 6.1 Truth Objects vs Projection Objects

Truth objects:
- normalized payload
- metrics
- signals
- twin
- snapshot

Projection object:
- weekly report

This boundary must not blur.

### 6.2 Computation vs Presentation

Computed objects must not become presentation-first.

Presentation-oriented additions may exist only downstream.

### 6.3 Identity and Provenance Integrity

No extension may weaken:

- source payload traceability
- twin-to-snapshot linkage
- snapshot-to-report linkage
- unitKey coherence

### 6.4 Required Field Stability

No extension may silently remove current minimum required fields defined in the required field matrix.

---

## 7. Allowed Extension Tests

A future extension should be considered acceptable only if it passes all of the following questions:

1. Does the object still mean the same thing?
2. Are current required fields still present?
3. Are identity and provenance still intact?
4. Has the truth/projection boundary remained unchanged?
5. Would a Phase 1 or Phase 2 validated bundle still be understandable after the extension?
6. Has the extension added capability without redefining role?

If the answer to any of these is no, the extension should be rejected or redesigned.

---

## 8. Examples Of Allowed Extensions

### Example A — Snapshot audit metadata

Allowed:

- adding `integrityMeta`
- adding `bundleVersion`
- adding `validationMeta`

Why allowed:

- the snapshot remains a frozen evidence object
- no truth boundary is changed

### Example B — Weekly report delivery metadata

Allowed:

- adding `deliveryChannel`
- adding `audienceType`
- adding `distributionStatus`

Why allowed:

- these enrich delivery semantics
- they do not promote the report to truth source

### Example C — Twin rationale metadata

Allowed:

- adding `stateRationale`
- adding `classifierVersion`

Why allowed:

- the twin remains the canonical truth object
- identity and role remain stable

---

## 9. Examples Of Forbidden Extensions

### Example A — Report as state source

Forbidden:

- adding fields that make the weekly report the canonical state authority

Why forbidden:

- this breaks the truth/projection boundary

### Example B — Snapshot without payload lineage

Forbidden:

- dropping `sourcePayloadIds`
- replacing lineage with free-text notes

Why forbidden:

- this breaks provenance integrity

### Example C — Metric object as UI label container

Forbidden:

- replacing metric structure with display labels and formatting-first fields

Why forbidden:

- this destroys metric identity as a computed diagnostic object

---

## 10. Success Criteria

These extension rules should be considered successful if they help future work answer:

- can this field be added safely?
- does this extension preserve object identity?
- are we enriching the object or redefining it?
- are we growing truth architecture or blurring it?
- can future phases extend outputs without corrupting current semantics?

That is the real purpose of extension governance.

---

## 11. Summary

The NEXUS™ diagnostic core can and should evolve.

But future evolution must happen through controlled additive extension, not through silent semantic mutation.

These rules protect the system by ensuring that canonical objects may become richer while still remaining:

- structurally stable
- semantically consistent
- referentially coherent
- architecturally trustworthy

That is the correct protection layer for future Phase 3 growth.
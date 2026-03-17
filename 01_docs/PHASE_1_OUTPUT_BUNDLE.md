# PHASE 1 OUTPUT BUNDLE

Canonical output bundle definition for the validated NEXUS™ Phase 1 diagnostic core.

---

## 1. Purpose

This document defines the official output bundle produced by the NEXUS™ Phase 1 diagnostic core.

Its function is to establish what a valid Phase 1 run must generate, preserve, and expose as canonical system output.

This document exists to prevent:

- output drift
- uncontrolled output growth
- narrative-first distortion
- frontend-first reinterpretation
- undocumented output mutations

The output bundle is part of the sovereign system contract.

---

## 2. Scope

This document applies only to the currently validated Phase 1 core.

It does not define:

- Phase 2 outputs
- simulation outputs
- governance scoring outputs
- maturity outputs
- badge outputs
- API response policies
- UI rendering policies
- PDF rendering policies

It applies strictly to the minimum validated diagnostic core.

---

## 3. Canonical Phase 1 Output Principle

A valid Phase 1 run is not considered complete merely because the engine executes.

A valid Phase 1 run must produce a canonical output bundle composed of:

1. normalized payload
2. computed metrics
3. computed signals
4. twin state
5. diagnostic snapshot
6. weekly report
7. generated artifact files
8. passing minimum integration validation

This is the minimum acceptable system evidence for a completed Phase 1 run.

---

## 4. Canonical Output Components

### 4.1 Normalized Payload

The normalized payload is the validated and normalized operational input used by the engine.

Its purpose is to ensure that the system never reasons directly from raw or semantically unstable input.

The normalized payload must preserve:

- payload identity
- organization identity
- site identity
- sector identity
- operational week
- normalized numeric fields
- normalized text fields
- validation metadata
- normalization metadata

The normalized payload is an internal truth object, not a presentation object.

---

### 4.2 Metrics

The Phase 1 metric bundle must contain exactly the required metric set.

Current required metrics:

- throughput
- utilization
- latency
- revenue_leakage
- staffing_pressure
- reporting_reliability

Each metric must include, at minimum:

- code
- value
- unit
- computedAt
- sourcePayloadId
- confidence

A metric bundle missing any required Phase 1 metric is invalid.

---

### 4.3 Signals

The Phase 1 signal bundle must contain the signal results produced by diagnostic interpretation.

Current signal set:

- latency_signal
- leakage_signal
- volatility_signal
- staffing_pressure_signal
- reporting_gap_signal
- constraint_signal

Each signal must include, at minimum:

- code
- active
- severity
- message
- evidence
- relatedMetricCodes
- generatedAt

Signals are interpretive objects.  
They sit between metrics and state.

---

### 4.4 Twin State

The twin state is the current canonical operational state object for a site within an operational week.

It must include, at minimum:

- twinId
- unitKey
- stateLabel
- metrics
- signals
- constraints
- diagnosticSummary
- decisionOutput
- snapshotRef
- lastUpdatedAt

The twin is a truth object.  
It is not a UI summary and not a report surrogate.

---

### 4.5 Diagnostic Snapshot

The diagnostic snapshot is the frozen evidence object for a completed diagnostic cycle.

It must include, at minimum:

- snapshotId
- twinId
- unitKey
- generatedAt
- stateLabel
- metrics
- signals
- constraints
- diagnosticType
- diagnosticSummary
- decisionOutput
- sourcePayloadIds
- version

The snapshot serves as canonical historical evidence for the diagnostic interpretation that occurred.

---

### 4.6 Weekly Report

The weekly report is the institutional projection of the snapshot.

It must include, at minimum:

- reportId
- reportType
- generatedAt
- unitKey
- snapshotId
- twinId
- title
- subtitle
- executiveSummary
- priorityActions
- sections
- linkedSnapshot
- deliveryStatus
- version

The weekly report is not the system’s truth source.  
It is a projection of already-established truth.

---

### 4.7 Artifact Files

A valid Phase 1 run must generate persistent JSON artifacts on disk.

At minimum, the run must write:

- one diagnostic artifact file
- one weekly report artifact file

Example file patterns:

- `10_examples/diagnostics/<scenario>.diagnostic.json`
- `10_examples/weekly_reports/<scenario>.report.json`

The artifact layer provides replayable, inspectable, and reviewable output evidence.

---

### 4.8 Minimum Integration Validation

A valid Phase 1 run must also be validated through the minimum integration test path.

That test must verify at least:

- engine execution succeeds
- required metrics exist
- twinId exists
- snapshotId exists
- reportId exists
- stateLabel is valid
- weekly report sections exist

Without this minimum validation, the output bundle is considered unverified.

---

## 5. Canonical Bundle Structure

The canonical conceptual output bundle of a successful Phase 1 run is:

```text
normalizedPayload
metrics
signals
twin
snapshot
weeklyReport
artifactFiles
integrationValidation
```

This structure defines the minimum bundle identity.

---

## 6. Bundle Completeness Rule

A Phase 1 output is incomplete if any of the following is missing:

- normalized payload
- one or more required metrics
- twin state
- diagnostic snapshot
- weekly report
- persisted JSON artifacts
- passing integration validation

If one of these is absent, the run may be executable but it is not canonically complete.

---

## 7. Bundle Integrity Rule

The output bundle must preserve internal referential coherence.

At minimum, the following references must remain consistent:

- `twin.twinId == snapshot.twinId == weeklyReport.twinId`
- `snapshot.snapshotId == weeklyReport.snapshotId`
- `snapshot.unitKey == weeklyReport.unitKey`
- `snapshot.sourcePayloadIds` must reference the original payload identity
- `weeklyReport.linkedSnapshot` must reflect the generated snapshot object

Any output bundle that breaks referential coherence is invalid.

---

## 8. Phase 1 State Expectations

The output bundle must support at least the currently allowed Phase 1 state labels:

- stable
- fragile
- constrained
- degraded
- recovering

The system must also be capable of producing differentiated decision outputs aligned to state.

Examples:

- stable → monitor_and_preserve → P3
- constrained → corrective_focus → P2
- degraded → stabilize_now → P1

This confirms that the bundle carries both descriptive and prescriptive output.

---

## 9. Current Validated Evidence

The current Phase 1 bundle has already been validated through contrast scenarios that demonstrate at least:

### Stable case

Expected characteristics:

- low signal activity
- no material active constraints
- stable state
- preserve-oriented recommendation

### Constrained case

Expected characteristics:

- multiple active operational signals
- active constraints
- constrained state
- corrective recommendation

This contrast evidence confirms that the output bundle is not static formatting only, but carries operational discrimination.

---

## 10. What This Bundle Does Not Yet Include

The current Phase 1 output bundle does not yet include:

- database persistence contracts
- API serialization policy
- public response envelopes
- PDF output
- email delivery artifacts
- governance scoring outputs
- maturity outputs
- badge outputs
- simulation outputs
- multi-run comparator outputs
- historical trend outputs

Those belong to later layers and must not be silently added into the Phase 1 bundle without explicit canonization.

---

## 11. Change Control Rule

No new object may be added to the Phase 1 output bundle without explicit architectural approval.

No existing object may be removed from the Phase 1 output bundle without explicit architectural approval.

No existing output object may change semantic role without explicit architectural approval.

This rule exists to prevent silent mutation of system truth.

---

## 12. Phase 1 Canonical Output Bundle Summary

A Phase 1 run is canonically complete only when it produces:

- normalized payload
- 6 required metrics
- signal bundle
- twin state
- diagnostic snapshot
- weekly report
- persisted JSON artifacts
- passing integration validation

This is the official minimum output contract of the validated NEXUS™ Phase 1 diagnostic core.
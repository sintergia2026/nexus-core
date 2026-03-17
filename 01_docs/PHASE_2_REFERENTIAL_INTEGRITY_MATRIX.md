# PHASE 2 REFERENTIAL INTEGRITY MATRIX

Referential integrity matrix for the canonical output objects of the NEXUS™ diagnostic core.

---

## 1. Purpose

This document defines the minimum referential integrity rules that must remain true across the canonical output objects of the NEXUS™ diagnostic core.

Its purpose is to ensure that output objects are not only individually complete, but also structurally coherent when related to each other.

This document exists because a system may produce valid isolated objects while still producing an invalid system bundle if object references drift, break, or become semantically inconsistent.

---

## 2. Core Principle

Canonical outputs must preserve referential coherence across identity, context, and provenance layers.

This means that output objects must agree on:

- which operational unit they represent
- which diagnostic cycle they belong to
- which truth object they derive from
- which payload source they ultimately trace back to

If these references diverge, the system output becomes unreliable even if all objects remain syntactically valid.

---

## 3. Canonical Output Objects Covered

This referential integrity matrix applies to the following canonical output objects:

1. normalized payload
2. metrics
3. signals
4. twin state
5. diagnostic snapshot
6. weekly report

---

## 4. Referential Integrity Layers

The current output system depends on four main integrity layers:

### 4.1 Identity Layer

Defines the unique identity of each object.

Examples:

- `payloadId`
- `twinId`
- `snapshotId`
- `reportId`

### 4.2 Context Layer

Defines the operational context represented by the object.

Examples:

- `organizationId`
- `siteId`
- `sectorType`
- `operationalWeek`

### 4.3 Provenance Layer

Defines where a downstream object came from.

Examples:

- `sourcePayloadId`
- `sourcePayloadIds`
- `snapshotRef`
- `linkedSnapshot`

### 4.4 Projection Layer

Defines how downstream output objects point back to upstream truth objects.

Examples:

- weekly report → snapshot
- snapshot → twin
- twin → payload lineage via metrics

---

## 5. Referential Integrity Matrix

## 5.1 Normalized Payload → Metrics

Each metric must remain traceable to the normalized payload used in the diagnostic cycle.

### Required rule

For every metric in the run:

- `metric.sourcePayloadId == normalizedPayload.payloadId`

### Reason

This preserves metric provenance and prevents detached metric computation.

### Failure example

- metric exists
- metric value is present
- `sourcePayloadId` points to another payload or is missing

This is a referential integrity failure.

---

## 5.2 Normalized Payload → Snapshot

The snapshot must preserve payload lineage through source payload references.

### Required rule

- `normalizedPayload.payloadId` must appear inside `snapshot.sourcePayloadIds`

### Reason

The snapshot is a frozen evidence object and must retain traceability to the original diagnostic input.

### Failure example

- snapshot exists
- snapshot looks structurally complete
- `sourcePayloadIds` omits the real originating payload

This is a provenance failure.

---

## 5.3 Twin State ↔ Snapshot

The snapshot must represent the same twin identity as the twin object generated in the same run.

### Required rules

- `snapshot.twinId == twin.twinId`
- `twin.snapshotRef == snapshot.snapshotId`

### Reason

The twin and snapshot must remain mutually coherent:

- the snapshot freezes the twin state
- the twin points to the snapshot generated from that state

### Failure example

- twin ID and snapshot twin ID differ
- twin snapshotRef points elsewhere

This breaks the truth-evidence relationship.

---

## 5.4 Snapshot ↔ Weekly Report

The weekly report must remain explicitly downstream of the snapshot.

### Required rules

- `weeklyReport.snapshotId == snapshot.snapshotId`
- `weeklyReport.twinId == snapshot.twinId`

### Reason

The weekly report is a projection object and must reference the exact snapshot from which it was derived.

### Failure example

- report title or content looks correct
- but report snapshotId references another run

This is a projection integrity failure.

---

## 5.5 Snapshot ↔ Weekly Report.linkedSnapshot

The embedded linked snapshot inside the weekly report must reflect the actual generated snapshot object.

### Required rules

- `weeklyReport.linkedSnapshot.snapshotId == snapshot.snapshotId`
- `weeklyReport.linkedSnapshot.twinId == snapshot.twinId`
- `weeklyReport.linkedSnapshot.unitKey == snapshot.unitKey`
- `weeklyReport.linkedSnapshot.stateLabel == snapshot.stateLabel`

### Reason

If `linkedSnapshot` exists, it must not be a loose summary.  
It must remain semantically aligned with the actual snapshot.

### Failure example

- report references the correct snapshot ID externally
- but embedded linkedSnapshot differs in state or unitKey

This is an embedded integrity failure.

---

## 5.6 Twin State ↔ Weekly Report

Even though the report is downstream of the snapshot, it must still remain aligned to the same twin identity.

### Required rule

- `weeklyReport.twinId == twin.twinId`

### Reason

The report must project the same operational truth state represented by the twin.

### Failure example

- report derives from correct snapshot
- twinId differs from the actual generated twin

This creates ambiguity around the truth source.

---

## 5.7 unitKey Consistency Across Twin, Snapshot, and Report

The operational unit context must remain stable across all truth and projection objects.

### Required rules

- `twin.unitKey == snapshot.unitKey`
- `snapshot.unitKey == weeklyReport.unitKey`

### Required nested agreement

Within each `unitKey`, the following must remain consistent:

- `organizationId`
- `siteId`
- `sectorType`
- `operationalWeek.weekId`
- `operationalWeek.weekStart`
- `operationalWeek.weekEnd`
- `operationalWeek.timezone`
- `operationalWeek.calendarYear`
- `operationalWeek.weekNumber`

### Reason

Objects must agree on what real-world operational unit and period they represent.

### Failure example

- same twinId but different siteId in report
- same snapshotId but different week metadata in linkedSnapshot

This is a context integrity failure.

---

## 5.8 State and Decision Projection Consistency

The report must not contradict the truth objects on state and decision posture.

### Required rules

At minimum, the following should remain aligned:

- `weeklyReport.linkedSnapshot.stateLabel == snapshot.stateLabel`
- `snapshot.decisionOutput.decisionLabel` should remain semantically aligned with `weeklyReport.priorityActions`
- `snapshot.decisionOutput.priority` should remain semantically aligned with report severity language

### Reason

Projection objects may rephrase, but they must not invert or weaken truth.

### Failure example

- snapshot says `degraded / stabilize_now / P1`
- report language reads like a monitoring scenario

This is a semantic projection failure.

---

## 5.9 Metric and Signal Context Consistency

Signals must remain interpretable relative to the metric set of the same run.

### Required rules

- every `signal.relatedMetricCodes` entry should correspond to a metric code present in the same output run, when relevant
- signal evidence should remain semantically compatible with the metric values of that run

### Reason

Signals are interpretive objects and cannot drift away from the metric layer they summarize.

### Failure example

- signal references `latency`
- but no latency metric exists in the bundle

This is an interpretive integrity failure.

---

## 6. Minimum Referential Integrity Rules Summary

At minimum, the following must remain true:

- `metric.sourcePayloadId == normalizedPayload.payloadId`
- `normalizedPayload.payloadId ∈ snapshot.sourcePayloadIds`
- `snapshot.twinId == twin.twinId`
- `twin.snapshotRef == snapshot.snapshotId`
- `weeklyReport.snapshotId == snapshot.snapshotId`
- `weeklyReport.twinId == twin.twinId`
- `twin.unitKey == snapshot.unitKey`
- `snapshot.unitKey == weeklyReport.unitKey`
- `weeklyReport.linkedSnapshot.snapshotId == snapshot.snapshotId`
- `weeklyReport.linkedSnapshot.twinId == snapshot.twinId`

If any of these fail, the bundle should be treated as referentially compromised.

---

## 7. Integrity Failure Categories

Referential integrity failures should be understood in the following categories.

### 7.1 Identity Failure

When IDs do not match across objects that should reference the same entity.

### 7.2 Context Failure

When unitKey or operational week data drift across related objects.

### 7.3 Provenance Failure

When downstream objects lose traceability to source payloads.

### 7.4 Projection Failure

When projection objects contradict or mispoint to upstream truth objects.

### 7.5 Interpretive Failure

When signals or report semantics no longer correspond to the metrics and decision outputs of the same run.

---

## 8. What This Matrix Does Not Yet Define

This document does not yet define:

- automated referential integrity validators
- hash-based object integrity
- formal schema tooling
- persistence-layer foreign keys
- API response envelope integrity
- multi-run lineage chains

Those may come later.

This matrix defines the minimum semantic reference rules for the current output layer.

---

## 9. Success Criteria

This matrix should be considered useful if it allows the team to answer, for any output bundle:

- do all objects point to the same operational truth?
- does the report point to the correct snapshot?
- does the snapshot preserve real payload lineage?
- do IDs and unit context remain coherent?
- did a future change silently break cross-object integrity?

That is the real purpose of referential integrity hardening.

---

## 10. Summary

The NEXUS™ diagnostic core now needs outputs that are not only complete in isolation, but also structurally coherent as a system.

This matrix ensures that canonical outputs remain connected across:

- identity
- context
- provenance
- projection

That is necessary for any serious future step involving persistence, APIs, delivery bundles, or institutional trust.
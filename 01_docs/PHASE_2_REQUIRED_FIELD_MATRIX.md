# PHASE 2 REQUIRED FIELD MATRIX

Required field matrix for the canonical output objects of the NEXUS™ diagnostic core.

---

## 1. Purpose

This document defines the minimum required fields for each canonical output object currently produced by the NEXUS™ diagnostic core.

Its purpose is to reduce ambiguity around output completeness and to establish a stricter contract baseline for future:

- serialization
- persistence
- bundle packaging
- API exposure
- validation hardening

This document does not redefine object semantics.  
It defines the minimum field expectations that must remain present for an output object to be considered canonically complete.

---

## 2. Core Principle

A valid output object is not merely an object that exists.

A valid output object must contain the minimum fields required to preserve:

- identity
- traceability
- interpretability
- referential integrity
- downstream usability

If these fields are missing, the object may still be syntactically valid JSON, but it is not canonically complete.

---

## 3. Canonical Output Objects Covered

This field matrix applies to the following canonical output objects:

1. normalized payload
2. metric
3. signal
4. twin state
5. diagnostic snapshot
6. weekly report

---

## 4. Required Field Matrix

## 4.1 Normalized Payload

The normalized payload must include, at minimum:

- `payloadId`
- `capturedAt`
- `source`
- `sectorType`
- `organizationId`
- `organizationName`
- `siteId`
- `siteName`
- `operationalWeek`
- `throughput`
- `revenue`
- `staffing`
- `time`
- `demand`
- `reporting`
- `normalizationMeta`

### Required nested fields

#### `operationalWeek`
- `weekId`
- `weekStart`
- `weekEnd`
- `timezone`
- `calendarYear`
- `weekNumber`

#### `throughput`
- `unitsCompleted`
- `unitLabel`

#### `revenue`
- `grossRevenue`
- `capturedRevenue`
- `estimatedLeakage`
- `currency`

#### `staffing`
- `scheduledHours`
- `workedHours`
- `headcountScheduled`
- `headcountActual`

#### `time`
- `avgCycleTimeMinutes`
- `avgWaitTimeMinutes`
- `avgServiceTimeMinutes`

#### `demand`
- `demandUnits`
- `peakDemandUnits`
- `volatilityIndex`

#### `reporting`
- `expectedReports`
- `submittedReports`
- `missingFieldsCount`
- `lateSubmissionsCount`
- `sourceReliabilityScore`

#### `normalizationMeta`
- `normalizedAt`
- `warnings`
- `sourceValidation`

#### `normalizationMeta.sourceValidation`
- `valid`
- `errors`
- `warnings`

### Notes

- `notes`, `tags`, and `submittedBy` are useful and expected in current examples, but they are not part of the strict minimum required baseline yet.
- The normalized payload remains an internal truth object.

---

## 4.2 Metric

Each metric object must include, at minimum:

- `code`
- `value`
- `unit`
- `computedAt`
- `sourcePayloadId`
- `confidence`

### Notes

- Metric identity is code-based.
- A missing `sourcePayloadId` weakens traceability and should be treated as contract failure.

---

## 4.3 Signal

Each signal object must include, at minimum:

- `code`
- `active`
- `severity`
- `message`
- `evidence`
- `relatedMetricCodes`
- `generatedAt`

### Notes

- Inactive signals are still valid canonical objects and must not be treated as absent.
- `evidence` may be empty, but the field itself must exist.

---

## 4.4 Twin State

The twin state must include, at minimum:

- `twinId`
- `unitKey`
- `stateLabel`
- `metrics`
- `signals`
- `constraints`
- `diagnosticSummary`
- `decisionOutput`
- `snapshotRef`
- `lastUpdatedAt`

### Required nested fields

#### `unitKey`
- `organizationId`
- `siteId`
- `sectorType`
- `operationalWeek`

#### `unitKey.operationalWeek`
- `weekId`
- `weekStart`
- `weekEnd`
- `timezone`
- `calendarYear`
- `weekNumber`

#### `decisionOutput`
- `decisionLabel`
- `summary`
- `recommendedActions`
- `priority`

### Notes

- The twin is a truth object.
- `metrics`, `signals`, and `constraints` may vary in content, but the fields themselves must exist.

---

## 4.5 Diagnostic Snapshot

The diagnostic snapshot must include, at minimum:

- `snapshotId`
- `twinId`
- `unitKey`
- `generatedAt`
- `stateLabel`
- `metrics`
- `signals`
- `constraints`
- `diagnosticType`
- `diagnosticSummary`
- `decisionOutput`
- `sourcePayloadIds`
- `version`

### Required nested fields

#### `unitKey`
- `organizationId`
- `siteId`
- `sectorType`
- `operationalWeek`

#### `unitKey.operationalWeek`
- `weekId`
- `weekStart`
- `weekEnd`
- `timezone`
- `calendarYear`
- `weekNumber`

#### `decisionOutput`
- `decisionLabel`
- `summary`
- `recommendedActions`
- `priority`

### Notes

- The snapshot is the frozen evidence object.
- `sourcePayloadIds` must exist even if only one payload is present.

---

## 4.6 Weekly Report

The weekly report must include, at minimum:

- `reportId`
- `reportType`
- `generatedAt`
- `unitKey`
- `snapshotId`
- `twinId`
- `title`
- `subtitle`
- `executiveSummary`
- `priorityActions`
- `sections`
- `linkedSnapshot`
- `deliveryStatus`
- `version`

### Required nested fields

#### `unitKey`
- `organizationId`
- `siteId`
- `sectorType`
- `operationalWeek`

#### `unitKey.operationalWeek`
- `weekId`
- `weekStart`
- `weekEnd`
- `timezone`
- `calendarYear`
- `weekNumber`

#### `sections[]`
Each section must include:
- `sectionCode`
- `title`
- `content`

### Notes

- The report is a projection object, not a truth object.
- `linkedSnapshot` must exist even if later reporting surfaces also reference the snapshot externally.

---

## 5. Object Completeness Rules

An object should be treated as canonically incomplete if any minimum required field is missing.

Examples:

- a metric without `sourcePayloadId`
- a signal without `generatedAt`
- a twin without `snapshotRef`
- a snapshot without `sourcePayloadIds`
- a weekly report without `sections`

These are contract failures, not cosmetic omissions.

---

## 6. Minimum Array Presence Rules

The following array fields must always exist, even if empty in a future case:

- `normalizationMeta.warnings`
- `normalizationMeta.sourceValidation.errors`
- `normalizationMeta.sourceValidation.warnings`
- `signals[].evidence`
- `signals[].relatedMetricCodes`
- `decisionOutput.recommendedActions`
- `sourcePayloadIds`
- `priorityActions`
- `sections`

Empty arrays are acceptable.  
Missing arrays are not.

---

## 7. Required Field Stability Rule

The minimum required fields defined here should be treated as stable unless explicitly revised through architectural review.

This means:

- new optional fields may be added later
- nested structures may grow carefully
- but these minimum fields should not disappear silently

Removing a required field is a semantic contract change.

---

## 8. What This Matrix Does Not Yet Define

This document does not yet define:

- field data types in formal schema notation
- enum restrictions for every field
- nullability policy for every optional field
- API serialization policy
- persistence storage mappings
- validation tooling implementation

Those may come later.

This matrix defines minimum field presence only.

---

## 9. Success Criteria

This matrix should be considered useful if it allows the team to answer, for any canonical object:

- is the object complete?
- is the object missing identity?
- is the object missing traceability?
- is the object missing downstream usability?
- did a future change silently weaken the contract?

That is the real purpose of the matrix.

---

## 10. Summary

The NEXUS™ diagnostic core already produces meaningful outputs.

This field matrix ensures that those outputs can now be judged not only by whether they exist, but by whether they are canonically complete.

This is a necessary step toward:

- stronger contracts
- stronger validation
- stronger packaging
- stronger future system maturity

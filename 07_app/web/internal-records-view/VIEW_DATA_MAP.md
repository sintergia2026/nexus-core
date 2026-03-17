# INTERNAL RECORDS VIEW DATA MAP

Data mapping for the first consumer-facing internal records view in NEXUS™.

---

## 1. Purpose

This document maps each block of the first internal records view to the exact internal API route and response fields it should consume.

Its purpose is to prevent UI drift.

The view should not guess which fields to use.  
It should consume only what is explicitly justified by the current Phase 4 transport layer.

---

## 2. Core Principle

The view must consume the transport layer exactly as currently implemented.

That means:

- no direct filesystem reads
- no direct persistence-layer reads
- no direct service-layer bypass
- no extra inferred fields beyond current envelopes

The view should depend only on stable transport outputs.

---

## 3. Block-to-Endpoint Mapping

The initial view contains three blocks:

- Block A — Active Record Summary
- Block B — Historical Record List
- Block C — Comparison Panel

Each block maps to a specific internal API route.

---

## 4. Block A — Active Record Summary

### Route

    GET /internal/api/records/active?organizationId=org-sintergia-demo&siteId=site-004&weekId=site-004::2026-W11&view=summary

### Expected response type

- `SingleRecordSummaryEnvelope`

### Required fields from response

Top-level:

- `responseType`
- `found`
- `record`
- `servedAt`
- `error`

Nested `record` fields:

- `persistedBundleId`
- `recordStatus`
- `organizationId`
- `siteId`
- `weekId`
- `stateLabel`
- `decisionLabel`
- `priority`
- `activeSignals`
- `activeConstraints`
- `storedAt`

### Fields not required for first rendering

- `sectorType`
- `calendarYear`
- `weekNumber`
- `bundleVersion`
- `persistenceVersion`
- `snapshotId`
- `twinId`
- `reportId`

These may be kept available for debugging or secondary display later, but are not required for the first version.

### Rendering intent

This block should answer:

- what is the current governing record?
- what is its posture?
- what active signals/constraints define it?

---

## 5. Block B — Historical Record List

### Route

    GET /internal/api/records/query?siteId=site-004&view=summary

### Expected response type

- `MultiRecordSummaryEnvelope`

### Required fields from response

Top-level:

- `responseType`
- `resultCount`
- `records`
- `servedAt`
- `error`

Per `record` item:

- `persistedBundleId`
- `recordStatus`
- `weekId`
- `stateLabel`
- `decisionLabel`
- `priority`
- `storedAt`

### Recommended optional fields for later use

- `activeSignals`
- `activeConstraints`
- `snapshotId`
- `reportId`

### Rendering intent

This block should answer:

- what historical records exist for this context?
- which one is active?
- which ones are superseded?
- how did the governing chain evolve over time?

### Sorting recommendation

For the first version, records may be rendered in the order returned by the API.

Later, a better order should likely be:

- newest first by `storedAt`
or
- revision-aware order if revision parsing becomes a UI concern

---

## 6. Block C — Comparison Panel

### Route

    POST /internal/api/records/compare

### Request body

    {
      "leftRecordId": "pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0001",
      "rightRecordId": "pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0002"
    }

### Expected response type

- `ComparisonEnvelope`

### Required top-level fields

- `responseType`
- `leftRecordId`
- `rightRecordId`
- `contextSummary`
- `postureComparison`
- `signalComparison`
- `constraintComparison`
- `metricDifferences`
- `executiveReading`
- `servedAt`
- `error`

### Required comparison fields for first rendering

From `contextSummary`:

- `left.recordStatus`
- `right.recordStatus`
- `left.weekId`
- `right.weekId`

From `postureComparison`:

- `stateLabelChanged`
- `decisionLabelChanged`
- `priorityChanged`
- `leftStateLabel`
- `rightStateLabel`
- `leftDecisionLabel`
- `rightDecisionLabel`
- `leftPriority`
- `rightPriority`

From `signalComparison`:

- `leftActiveSignals`
- `rightActiveSignals`
- `addedSignals`
- `removedSignals`

From `constraintComparison`:

- `leftActiveConstraints`
- `rightActiveConstraints`
- `addedConstraints`
- `removedConstraints`

From `metricDifferences`:

- each item’s:
  - `code`
  - `leftValue`
  - `rightValue`

From root:

- `executiveReading`

### Rendering intent

This block should answer:

- did posture change?
- did active signals change?
- did active constraints change?
- did metrics change?
- what is the executive reading of the comparison?

---

## 7. Error Handling Map

Each block must honor the envelope error model.

### Block A error behavior

If:

- `found = false`
or
- `error != null`

Then render:

- “Active record not available for this context.”

Optionally show:

- `error.code`
- `error.message`

---

### Block B error behavior

If:

- `error != null`

Then render:

- “Historical record list could not be loaded.”

If:

- `resultCount = 0`

Then render:

- “No historical records found.”

---

### Block C error behavior

If:

- `error != null`

Then render:

- “Comparison could not be completed.”

Optionally show:

- `error.code`
- `error.message`

---

## 8. Minimal UI Data Model By Block

### Block A minimal UI model

- record identity
- governing status
- posture
- active signals
- active constraints
- stored time

### Block B minimal UI model

- list of records
- status badge
- posture summary
- stored time

### Block C minimal UI model

- left/right record identity
- posture change flags
- signal delta
- constraint delta
- metric delta list
- executive reading

This is enough for version 1.

---

## 9. Fields To Ignore In Version 1

The first view should not try to render these fields yet:

- full normalized payload
- full metrics list in Block A or B
- full weekly report
- artifact references
- validation block
- immutability block
- storage backend internals
- bundle raw structure

Those fields remain available in full envelopes, but they are not required for the first view.

---

## 10. Success Condition

This data map should be considered correct if the first view can render all three blocks using only:

- `/internal/api/records/active?view=summary`
- `/internal/api/records/query?view=summary`
- `/internal/api/records/compare`

without needing any direct access to lower layers.

That is the correct Phase 4 consumer dependency model.

---

## 11. Summary

The first internal records view should consume only three transport surfaces:

- active summary
- summary query
- comparison

Each block now has a defined data contract for rendering.

This document is the final bridge before first UI implementation.
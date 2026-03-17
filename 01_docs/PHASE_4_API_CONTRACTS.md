# PHASE 4 API CONTRACTS

Initial internal API contract definitions for the NEXUS™ Phase 4 service envelope layer.

---

## 1. Purpose

This document defines the first internal API contracts for exposing the NEXUS™ persistence and comparison layer.

Its purpose is to prevent transport-level improvisation.

The system already has internal service logic for:

- active record retrieval
- exact record retrieval
- query retrieval
- summary retrieval
- record comparison

This document defines how those capabilities should be represented as internal API contracts before HTTP transport is introduced.

---

## 2. Core Principle

The API contract must remain downstream of the current service layer.

That means API contracts should:

- expose existing service capabilities
- preserve governance semantics
- preserve distinction between full and summary payloads
- preserve comparison structure
- avoid redefining system truth

The contract is a transport agreement, not a new model.

---

## 3. Scope

This first contract set covers only:

- single full record retrieval
- single summary record retrieval
- active record retrieval by context
- active summary retrieval by context
- filtered record query
- filtered summary query
- record comparison

This contract set does not yet cover:

- persistence writes
- supersession writes through API
- bundle assembly through API
- authentication / authorization
- external public transport concerns

This is an internal-first contract scope.

---

## 4. Contract Families

The first API contracts should be grouped into these families:

### 4.1 Record retrieval contracts

Purpose:

- retrieve exact persisted records
- retrieve active persisted records by context

### 4.2 Record summary contracts

Purpose:

- retrieve lighter-weight projections for app and agent consumption

### 4.3 Query contracts

Purpose:

- retrieve sets of records by filters

### 4.4 Comparison contracts

Purpose:

- compare two persisted records and return structured deltas

---

## 5. Record Retrieval Contracts

### 5.1 Get persisted record by exact ID

Conceptual route:

    GET /internal/api/records/{persistedBundleId}

Response shape:

- `SingleRecordEnvelope`

Behavior:

- return full persisted record if found
- return `found: false` plus error block if missing

---

### 5.2 Get persisted record summary by exact ID

Conceptual route:

    GET /internal/api/records/{persistedBundleId}/summary

Response shape:

- `SingleRecordSummaryEnvelope`

Behavior:

- return summary projection if found
- return `found: false` plus error block if missing

---

### 5.3 Get active persisted record by context

Conceptual route:

    GET /internal/api/records/active?organizationId=...&siteId=...&weekId=...

Response shape:

- `SingleRecordEnvelope`

Behavior:

- return the unique active record for the context
- return explicit error if none found
- return explicit error if multiple active records found unexpectedly

---

### 5.4 Get active persisted record summary by context

Conceptual route:

    GET /internal/api/records/active/summary?organizationId=...&siteId=...&weekId=...

Response shape:

- `SingleRecordSummaryEnvelope`

Behavior:

- same governing semantics as full active retrieval
- but return summary projection only

---

## 6. Query Contracts

### 6.1 Query full records by filters

Conceptual route:

    GET /internal/api/records/query?...filters...

Supported initial filters:

- `organizationId`
- `siteId`
- `sectorType`
- `weekId`
- `calendarYear`
- `weekNumber`
- `snapshotId`
- `twinId`
- `recordStatus`

Response shape:

- `MultiRecordEnvelope`

Behavior:

- return all matching full persisted records
- preserve result count
- return empty list if no results

---

### 6.2 Query record summaries by filters

Conceptual route:

    GET /internal/api/records/query/summary?...filters...

Supported initial filters:

- same as full query

Response shape:

- `MultiRecordSummaryEnvelope`

Behavior:

- return all matching record summaries
- preserve result count
- return empty list if no results

---

## 7. Comparison Contracts

### 7.1 Compare two persisted records

Conceptual route:

    POST /internal/api/records/compare

Request body:

    {
      "leftRecordId": "...",
      "rightRecordId": "..."
    }

Response shape:

- `ComparisonEnvelope`

Behavior:

- return structured comparison if both records exist
- return explicit error block if one or both records are missing

This is the first internal comparison contract.

---

## 8. Canonical Request Parameters

The first internal contract layer should standardize these parameter names.

### Retrieval / query parameters

- `persistedBundleId`
- `organizationId`
- `siteId`
- `sectorType`
- `weekId`
- `calendarYear`
- `weekNumber`
- `snapshotId`
- `twinId`
- `recordStatus`

### Comparison body fields

- `leftRecordId`
- `rightRecordId`

These names should remain stable unless a later explicit contract revision changes them.

---

## 9. Response Type Mapping

The current internal envelope types should map as follows:

- exact full record → `SingleRecordEnvelope`
- exact summary record → `SingleRecordSummaryEnvelope`
- active full record → `SingleRecordEnvelope`
- active summary record → `SingleRecordSummaryEnvelope`
- filtered full query → `MultiRecordEnvelope`
- filtered summary query → `MultiRecordSummaryEnvelope`
- comparison → `ComparisonEnvelope`

This should remain the canonical mapping for the first Phase 4 contract layer.

---

## 10. Error Contract Principle

Every internal API contract should preserve explicit error signaling.

That means failures should not be represented as:

- ambiguous nulls only
- silent empty results where a uniqueness rule was expected
- hidden transport-only failure without semantic context

Errors should preserve:

- `code`
- `message`
- relevant `details`

This is already aligned with the current envelope types.

---

## 11. Governing Retrieval Semantics

The active retrieval contracts must preserve governing semantics.

That means:

- they do not return any arbitrary record for the context
- they return the unique `active` record
- they fail explicitly if:
  - none exists
  - multiple active records exist unexpectedly

This is essential.

Otherwise the API layer would weaken persistence governance.

---

## 12. Summary Projection Semantics

Summary contracts are not different truth.

They are reduced projections of the same persisted records.

That means summary contracts must preserve at least:

- identity
- governance status
- context
- posture
- active signals
- active constraints
- timing metadata

This is the correct lightweight operational surface.

---

## 13. Comparison Semantics

The comparison contract must preserve these output categories:

- context summary
- posture comparison
- signal comparison
- constraint comparison
- metric differences
- executive reading

These categories should remain stable in the first comparison contract version.

---

## 14. Versioning Rule

Every API response should include:

- `responseVersion`

Recommended initial version:

- `1.0.0`

This version applies to the response envelope contract, not necessarily to the persisted record itself.

That distinction must remain explicit.

---

## 15. Recommended Next Implementation Step

After this contract document, the next practical step should be:

- create a thin internal transport layer
- map internal routes to existing service resolvers
- avoid introducing new data shaping beyond the defined envelopes

In other words:

transport should come next, not more semantic redesign.

---

## 16. Summary

The first Phase 4 API contracts are now defined for internal system access.

They cover:

- full record retrieval
- summary record retrieval
- active governing retrieval
- filtered query retrieval
- structured comparison retrieval

These contracts should become the basis for the first actual internal HTTP transport layer.
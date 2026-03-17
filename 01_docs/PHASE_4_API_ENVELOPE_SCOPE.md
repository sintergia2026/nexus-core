# PHASE 4 API ENVELOPE SCOPE

Scope definition for the first API-facing envelope layer above the NEXUS™ persistence subsystem.

---

## 1. Purpose

This document defines what the first Phase 4 API envelope layer should do.

Its purpose is to expose the current persistence and retrieval capabilities through a stable system-facing surface without corrupting the architectural truth model.

This document exists because the system now has enough persistence maturity that continuing to operate only through scripts would become the next structural bottleneck.

Phase 4 should not begin by building presentation surfaces.  
Phase 4 should begin by defining a disciplined service envelope.

---

## 2. Current Starting Point

The system already supports:

- canonical bundle assembly
- bundle validation
- persisted bundle records
- persistence integrity checking
- persistence indexing
- index querying
- revision-aware persisted identity
- governed supersession
- historical record retention
- comparative retrieval
- executive comparison output

This means the system already has meaningful internal state and persistence discipline.

The next step is not to invent new truth objects.  
The next step is to expose current system capabilities safely.

---

## 3. Core Principle

The API envelope must expose the system.

It must not redefine the system.

That means the API layer must remain:

- downstream of truth
- downstream of persistence
- structurally thin
- semantically disciplined
- consistent with governance status
- safe for future app and agent consumption

The API envelope is a transport and service surface.  
It is not a new source of truth.

---

## 4. What Phase 4 Should Expose First

The first API envelope layer should expose only the most structurally justified surfaces.

Recommended first surfaces:

### 4.1 Active persisted record by context

Use case:

- get the current governing record for:
  - organization
  - site
  - week

This is the most important retrieval surface.

---

### 4.2 Historical records by context

Use case:

- retrieve all records for a context
- distinguish:
  - active
  - superseded
  - archived

This enables historical inspection and governance review.

---

### 4.3 Persisted record by exact ID

Use case:

- retrieve one exact persisted record by `persistedBundleId`

This preserves precise retrieval and deep inspection capability.

---

### 4.4 Index-backed filtered query

Use case:

- query records by:
  - organizationId
  - siteId
  - sectorType
  - weekId
  - recordStatus

This is the first operator/service retrieval layer.

---

### 4.5 Record comparison envelope

Use case:

- compare two persisted records
- expose structural deltas
- expose executive reading

This is already supported internally and should eventually become consumable as a service envelope.

---

## 5. What Phase 4 Should Not Expose First

The following should not be first API priorities:

- dashboard-first payload shaping
- PDF delivery surfaces
- presentation-first report formatting
- broad write mutation surfaces
- arbitrary update endpoints
- direct metric editing
- direct snapshot editing
- frontend-driven truth mutation
- multi-tenant access complexity before envelope discipline exists

These would introduce drift too early.

---

## 6. API Envelope Design Rule

The first API envelope should wrap existing canonical outputs rather than flattening them excessively.

That means the API should preserve clear distinction between:

- request context
- retrieval result metadata
- governing status
- persisted record identity
- canonical bundle content
- comparison result content

The API envelope should be readable and usable, but not at the cost of object meaning.

---

## 7. Recommended First Endpoint Families

The first envelope families should likely be conceptualized as:

### 7.1 Records

Examples:

- get active record by context
- get record by persistedBundleId
- get all records by context

### 7.2 Queries

Examples:

- query records by filters
- query only active records
- query only superseded records

### 7.3 Comparison

Examples:

- compare record A vs record B
- compare active vs superseded
- compare historical revisions

These are the most justified first categories.

---

## 8. Canonical API Response Principles

Every API response should preserve at least:

- response type
- response version
- request context
- success / failure status
- result payload
- result count where relevant
- timestamp
- error block when applicable

This is necessary to keep the API disciplined and extensible.

---

## 9. Recommended First API Envelope Shapes

The system should likely define three main envelope shapes first.

### 9.1 Single-record envelope

Purpose:

- return one persisted record

Should include:

- responseType
- responseVersion
- requestedContext
- found
- record
- servedAt

---

### 9.2 Multi-record envelope

Purpose:

- return multiple persisted records from query or context history

Should include:

- responseType
- responseVersion
- query
- resultCount
- records
- servedAt

---

### 9.3 Comparison envelope

Purpose:

- return comparison between two persisted records

Should include:

- responseType
- responseVersion
- leftRecordId
- rightRecordId
- contextSummary
- postureComparison
- signalComparison
- constraintComparison
- metricDifferences
- executiveReading
- servedAt

---

## 10. Governing Retrieval Rule

The API layer should eventually distinguish between:

### 10.1 Governing retrieval

Return the single `active` record for a context.

### 10.2 Historical retrieval

Return all records for a context, including superseded and archived.

This distinction must remain explicit in the API layer just as it is explicit in persistence governance.

---

## 11. Error Handling Principle

The API envelope must not hide retrieval ambiguity.

Examples:

- no matching active record
- multiple active records found unexpectedly
- record ID not found
- invalid comparison IDs
- invalid query filters

These should be surfaced explicitly through response metadata and error blocks.

Silent failure would weaken system trust.

---

## 12. Security / Governance Note

Phase 4 API scope should remain structurally internal-first.

That means first API design should assume:

- trusted internal usage
- service-to-service usage
- controlled app/backend usage
- agent-access usage under governance

It should not assume open public API exposure yet.

---

## 13. What Phase 4 Implementation Should Likely Reuse

The first API layer should reuse existing internal assets as much as possible.

Likely reusable components:

- persisted record loading
- index query logic
- revision-aware persistence identity
- supersession-governed record status
- compare-records logic
- compare-records-executive logic

This reduces duplication and preserves coherence.

---

## 14. Recommended First Phase 4 Deliverables

The first practical deliverables should likely be:

### Deliverable 1 — API envelope types

Formal types for:

- single-record envelope
- multi-record envelope
- comparison envelope

### Deliverable 2 — service resolver layer

Thin service functions for:

- get active record by context
- get records by query
- get record by ID
- compare records

### Deliverable 3 — internal API contract docs

A short contract note defining request and response shape.

### Deliverable 4 — first implementation surface

A thin internal API module, not yet full production transport.

This is the cleanest bridge into Phase 4.

---

## 15. What Success Looks Like

Phase 4 should be considered correctly started if the system can do the following without semantic drift:

- serve the active record for a context
- serve historical records for a context
- serve filtered query results
- serve a structured comparison result
- preserve truth/projection boundaries
- avoid flattening persistence meaning into presentation noise

That is the correct success condition.

---

## 16. Summary

Phase 3 created governed system memory.

Phase 4 should create governed system access.

The first API envelope layer should expose the persistence subsystem through disciplined service responses for:

- active record retrieval
- historical retrieval
- filtered query retrieval
- record comparison

That is the correct next architectural layer above the current persistence base.
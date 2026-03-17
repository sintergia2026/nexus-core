# INTERNAL RECORDS VIEW SCOPE

First consumer-facing view scope for the NEXUS™ Phase 4 internal records access layer.

---

## 1. Purpose

This view exists to become the first operational consumer of the new internal records transport layer.

Its purpose is to validate that the current Phase 4 routes are sufficient for real app-facing consumption.

This view is not intended to be a polished dashboard yet.

It is intended to become the first minimal usable inspection surface for:

- active record summary
- historical record summaries
- record comparison

---

## 2. Core Principle

This view must consume the existing internal API layer.

It must not bypass it.

That means the view should read from:

- `/internal/api/records/active`
- `/internal/api/records/query`
- `/internal/api/records/compare`

This keeps the web surface downstream of the service and transport layer.

---

## 3. Initial View Responsibilities

The first version of this view should do only three things.

### 3.1 Show the active record summary for a context

Minimum context:

- organizationId
- siteId
- weekId

Expected output:

- persistedBundleId
- recordStatus
- stateLabel
- decisionLabel
- priority
- activeSignals
- activeConstraints
- storedAt

---

### 3.2 Show historical record summaries for the same context

Expected output for each record:

- persistedBundleId
- recordStatus
- stateLabel
- decisionLabel
- priority
- storedAt

The list should make active vs superseded visually obvious.

---

### 3.3 Show comparison between two revisions

Initial comparison target:

- `rev-0001`
- `rev-0002`

Expected output:

- posture comparison
- signal comparison
- constraint comparison
- metric differences
- executive reading

This should validate that the comparison envelope is actually usable by a consumer view.

---

## 4. First Layout Recommendation

The first view should likely contain three blocks:

### Block A — Active Record Summary

Purpose:

- show the current governing record at a glance

### Block B — Historical Record List

Purpose:

- show all persisted records for the context
- distinguish active vs superseded

### Block C — Comparison Panel

Purpose:

- compare two selected or hardcoded records
- render the executive reading and structured differences

This is enough for version 1.

---

## 5. Recommended Initial Hardcoded Context

The first implementation may safely begin with this fixed context:

- `organizationId = org-sintergia-demo`
- `siteId = site-004`
- `weekId = site-004::2026-W11`

This is acceptable for the first validation surface.

Dynamic controls can come later.

---

## 6. What This View Should Not Do Yet

The first implementation should not try to do all of the following:

- persistence writes
- supersession actions
- advanced filtering UI
- editing records
- multi-context switching
- auth flows
- PDF rendering
- dashboard styling polish

Those belong later.

The first goal is simply to prove that the current API layer is consumable.

---

## 7. Success Condition

This first view should be considered successful if it can:

- render one active summary correctly
- render the historical summary list correctly
- render one structured comparison correctly
- rely only on the current internal API routes
- expose any missing transport gaps clearly

That is the correct first consumer validation target.

---

## 8. Summary

This view is the first real consumer of the Phase 4 internal records API.

Its job is to validate that the new access layer is sufficient for real usage through a minimal three-block interface:

- active summary
- historical summaries
- comparison panel
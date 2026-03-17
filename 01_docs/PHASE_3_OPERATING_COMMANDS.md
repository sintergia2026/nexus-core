# PHASE 3 OPERATING COMMANDS

Operating command reference for the NEXUS™ Phase 3 persistence layer.

---

## 1. Purpose

This document defines the practical command surface for operating the current Phase 3 persistence layer.

Its purpose is to make the persistence subsystem usable without relying on memory, guesswork, or scattered chat history.

This document answers:

- which command does what
- when each command should be used
- what output should be expected
- how command usage relates to governance status

This is the operating surface for the current persistence layer.

---

## 2. Core Principle

Phase 3 commands are not interchangeable.

Each command has a distinct role in one of the following categories:

- persistence creation
- persistence loading
- persistence verification
- persistence indexing
- persistence querying
- governed supersession
- legacy normalization

The operator should choose commands by intent, not by convenience.

---

## 3. Current Phase 3 Command Surface

The current Phase 3 persistence layer includes the following executable commands:

- `npm run phase3:persist-bundle -- <scenario-file>`
- `npm run phase3:load-persisted-bundle -- <scenario-file>`
- `npm run phase3:persistence-check -- <scenario-file>`
- `npm run phase3:system-check -- <scenario-file>`
- `npm run phase3:rebuild-index`
- `npm run phase3:query-index -- <filters>`
- `npm run phase3:superseding-persist -- <scenario-file>`
- `npm run phase3:normalize-legacy-status`

These together define the current persistence operating surface.

---

## 4. Command Reference

### 4.1 `phase3:persist-bundle`

Command:

    npm run phase3:persist-bundle -- <scenario-file>

Role:

- persists a bundle as a new persisted record

Use when:

- first-cycle persistence is needed
- a record should be stored without automatically superseding another one
- testing persistence mechanics before governed replacement is required

Current behavior:

- loads the bundle
- builds a persisted record
- saves the record through the filesystem adapter

Important note:

This command does not perform governed supersession handling by itself.

---

### 4.2 `phase3:load-persisted-bundle`

Command:

    npm run phase3:load-persisted-bundle -- <scenario-file>

Role:

- loads a persisted record by canonical persisted identity derived from the bundle context

Use when:

- you want to verify that persistence succeeded
- you want to inspect the currently expected persisted record
- you want to confirm stored identity and storage metadata

Current behavior:

- reconstructs the expected persisted bundle ID
- loads the persisted record from the filesystem adapter
- prints core identity fields and storage path

---

### 4.3 `phase3:persistence-check`

Command:

    npm run phase3:persistence-check -- <scenario-file>

Role:

- validates structural integrity of a persisted record against the source bundle

Use when:

- you want to confirm persisted-record coherence
- you want to validate identity linkage
- you want to verify storage metadata presence
- you want to confirm bundle truth integrity after persistence

Current behavior validates at least:

- record existence
- canonical identity coherence
- bundle identity linkage
- retrieval linkage
- storage metadata presence
- persisted bundle integrity

---

### 4.4 `phase3:system-check`

Command:

    npm run phase3:system-check -- <scenario-file>

Role:

- runs the full current Phase 3 persistence validation chain

Use when:

- you want the strongest current end-to-end operational validation
- you want to validate the current persistence stack after changes
- you want to verify Phase 2 bundle behavior and Phase 3 persistence behavior together

Current behavior runs:

1. typecheck
2. Phase 2 bundle assembly
3. Phase 2 bundle check
4. Phase 3 persist bundle
5. Phase 3 load persisted bundle
6. Phase 3 persistence check

This is the current master command for Phase 3 structural validation.

---

### 4.5 `phase3:rebuild-index`

Command:

    npm run phase3:rebuild-index

Role:

- rebuilds the persisted record index from stored persisted records

Use when:

- persisted records have been added
- record status has changed
- supersession has occurred
- legacy normalization has been executed
- the index must be refreshed before query operations

Current behavior:

- reads valid persisted records from storage
- excludes the index file itself
- regenerates the canonical index file

Important note:

Any persistence state transition should usually be followed by index rebuild.

---

### 4.6 `phase3:query-index`

Command:

    npm run phase3:query-index -- <filters>

Supported filter examples:

    npm run phase3:query-index -- --siteId site-004
    npm run phase3:query-index -- --organizationId org-sintergia-demo
    npm run phase3:query-index -- --recordStatus active
    npm run phase3:query-index -- --weekId site-004::2026-W11

Role:

- queries the persisted record index using filter-based retrieval

Use when:

- you want to inspect governing records
- you want to inspect historical records
- you want to retrieve records by context or status
- you want to see persistence surface results without direct file loading

Current behavior:

- loads the index
- applies filters
- prints matching entries

This is the current operator-facing retrieval surface.

---

### 4.7 `phase3:superseding-persist`

Command:

    npm run phase3:superseding-persist -- <scenario-file>

Role:

- persists a new record while explicitly superseding currently active records for the same context

Use when:

- a new record should become the governing record
- prior active records for the same context must transition to `superseded`
- you want governed replacement rather than naive persistence

Current behavior:

- loads the bundle
- finds current active records for the same context
- marks them `superseded`
- persists a new revision-aware record as `active`
- rebuilds the index

This is the correct command for governed persistence progression.

---

### 4.8 `phase3:normalize-legacy-status`

Command:

    npm run phase3:normalize-legacy-status

Role:

- normalizes legacy non-revision records so they do not remain incorrectly active

Use when:

- legacy records exist from pre-revision persistence
- you want to ensure old records are not left active improperly
- you want to clean the persistence layer after identity refinement adoption

Current behavior:

- scans persisted records
- identifies legacy IDs without `::rev-`
- downgrades legacy `active` records to `superseded`
- rebuilds the index

This is a transitional governance command, not a routine daily command.

---

## 5. Governance Interpretation Of Record Status

The persistence layer currently uses these record statuses.

### 5.1 `active`

Meaning:

- the current governing record for its context

Operational meaning:

- this is the default record to trust for current retrieval

### 5.2 `superseded`

Meaning:

- a historical record preserved after replacement by a newer governing record

Operational meaning:

- useful for audit, lineage, and historical comparison
- not the current governing truth for the context

### 5.3 `archived`

Meaning:

- a preserved record intentionally outside the active surface

Operational meaning:

- retained historically
- not the current governing record
- may not imply direct supersession

---

## 6. Recommended Command Usage Patterns

### 6.1 First-cycle persistence flow

Recommended order:

1. `phase2:bundle`
2. `phase3:persist-bundle`
3. `phase3:load-persisted-bundle`
4. `phase3:persistence-check`
5. `phase3:rebuild-index`

Use this when introducing persistence in a clean context.

---

### 6.2 Governing replacement flow

Recommended order:

1. `phase2:bundle`
2. `phase3:superseding-persist`
3. `phase3:query-index -- --recordStatus active`
4. `phase3:query-index -- --recordStatus superseded`

Use this when a new record should replace the current governing record for the same context.

---

### 6.3 Full structural validation flow

Recommended order:

1. `phase3:system-check`
2. `phase3:rebuild-index`
3. `phase3:query-index -- --siteId <siteId>`

Use this when validating the stack after code changes.

---

### 6.4 Legacy cleanup flow

Recommended order:

1. `phase3:normalize-legacy-status`
2. `phase3:rebuild-index`
3. `phase3:query-index -- --recordStatus superseded`

Use this when normalizing older pre-revision records.

---

## 7. What Not To Do

The following are bad operational habits.

### 7.1 Do not use `phase3:persist-bundle` when governed replacement is intended

If the intent is to replace the current governing record, use:

- `phase3:superseding-persist`

not plain persist.

### 7.2 Do not trust the index after status-changing operations unless it has been rebuilt

Any change to record status or stored record set should be followed by:

- `phase3:rebuild-index`

unless the command already performs it internally.

### 7.3 Do not assume historical records are governing records

`superseded` is preserved truth, but not governing truth.

### 7.4 Do not treat legacy normalization as a normal daily operation

It is a transitional cleanup path, not a routine workflow.

---

## 8. Recommended Operator Mental Model

Use this mental model:

- `persist-bundle` = store a record
- `load-persisted-bundle` = retrieve a record directly
- `persistence-check` = validate stored coherence
- `system-check` = validate the whole persistence chain
- `rebuild-index` = refresh the catalog
- `query-index` = explore the catalog
- `superseding-persist` = governed replacement
- `normalize-legacy-status` = transitional cleanup

This is the simplest correct operator model.

---

## 9. Current Architectural Judgment

The command surface is now strong enough to support real persistence operations without requiring hidden manual logic.

Why:

- command responsibilities are differentiated
- governance status is reflected in commands
- retrieval behavior is operationally usable
- supersession behavior is now explicit
- legacy normalization is separated from core persistence flow

This is a meaningful operating surface.

---

## 10. Summary

The Phase 3 persistence layer is now operated through a disciplined command surface.

The commands are not decorative.  
They map directly to real persistence responsibilities:

- create
- load
- verify
- rebuild
- query
- supersede
- normalize

That is the correct operating surface for the current persistence maturity level.
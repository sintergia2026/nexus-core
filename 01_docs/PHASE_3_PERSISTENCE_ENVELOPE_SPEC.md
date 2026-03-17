# PHASE 3 PERSISTENCE ENVELOPE SPEC

Canonical persistence envelope specification for storing a completed NEXUS™ diagnostic bundle as a durable system record.

---

## 1. Purpose

This document defines the exact conceptual shape of a persisted diagnostic bundle record.

Its purpose is to bridge the gap between:

- a bundle assembled in the filesystem
- and a bundle preserved as a durable retrievable system record

This document exists so persistence does not begin as ad hoc storage.

---

## 2. Core Principle

A persisted record is not just a saved JSON file.

A persisted record is a formally identified, integrity-preserving storage envelope for one completed diagnostic run.

That means the persistence envelope must preserve:

- identity
- structural meaning
- truth/projection boundaries
- replay trust
- retrievability
- version visibility

---

## 3. Persistence Unit

The canonical persistence unit is:

## one completed diagnostic bundle record

This means the persisted record must represent exactly one:

- organization/site/week context
- normalized intake lineage
- diagnostic run result
- snapshot evidence object
- weekly report projection
- validation context state

This is the correct persistence boundary.

---

## 4. Canonical Envelope Structure

The persisted diagnostic bundle record should conceptually follow this structure:

    persistedBundleRecord
    ├── persistedBundleId
    ├── persistenceVersion
    ├── recordStatus
    ├── createdAt
    ├── storedAt
    ├── unitKey
    ├── identity
    ├── bundle
    ├── immutability
    ├── retrieval
    └── storageMeta

This is the persistence envelope.

The already existing diagnostic bundle becomes the payload inside the envelope, not the full persistence record by itself.

---

## 5. Minimum Top-Level Envelope Fields

A persisted bundle record should include, at minimum, the following top-level fields:

- `persistedBundleId`
- `persistenceVersion`
- `recordStatus`
- `createdAt`
- `storedAt`
- `unitKey`
- `identity`
- `bundle`
- `immutability`
- `retrieval`
- `storageMeta`

These fields define the minimum persistence envelope.

---

## 6. Top-Level Field Semantics

### 6.1 `persistedBundleId`

Purpose:

- primary persistence identity of the stored record

This ID identifies the stored record, not merely the snapshot.

### 6.2 `persistenceVersion`

Purpose:

- version of the persistence envelope schema

Recommended current value:

- `1.0.0`

### 6.3 `recordStatus`

Purpose:

- lifecycle status of the persisted record

Recommended current value for first implementation:

- `active`

### 6.4 `createdAt`

Purpose:

- when the original bundle was created

This should generally align with bundle creation time.

### 6.5 `storedAt`

Purpose:

- when the bundle was persisted into durable storage

This is distinct from bundle creation time.

### 6.6 `unitKey`

Purpose:

- direct retrieval context for the operational unit and week

### 6.7 `identity`

Purpose:

- preserve key bundle-linked identifiers without forcing a full bundle parse first

### 6.8 `bundle`

Purpose:

- preserve the canonical diagnostic bundle as the persisted truth package

### 6.9 `immutability`

Purpose:

- preserve the declared mutability or freeze policy of the stored record

### 6.10 `retrieval`

Purpose:

- preserve storage-facing query keys and lookup hints

### 6.11 `storageMeta`

Purpose:

- preserve storage-specific metadata without polluting bundle truth semantics

---

## 7. Identity Block Specification

The identity block should include, at minimum:

- `bundleType`
- `bundleVersion`
- `snapshotId`
- `twinId`
- `reportId`
- `scenarioFile`

Recommended structure:

    identity
    ├── bundleType
    ├── bundleVersion
    ├── snapshotId
    ├── twinId
    ├── reportId
    └── scenarioFile

### Why this block exists

This allows fast inspection, indexing, and trust checks without drilling immediately into the entire bundle payload.

---

## 8. Bundle Field Specification

The `bundle` field should contain the already assembled canonical diagnostic bundle.

That means it should preserve:

- normalized payload
- metrics
- signals
- twin
- snapshot
- weekly report
- artifact references
- validation context

### Rule

The persistence envelope must not weaken the bundle.

The envelope wraps the bundle.  
It does not replace it.

---

## 9. Immutability Block Specification

The immutability block should declare the freeze semantics of the persisted record.

Recommended minimum fields:

- `bundleFrozen`
- `snapshotFrozen`
- `reportFrozen`
- `validationFrozen`
- `mutationPolicy`

Recommended initial values:

- `bundleFrozen: true`
- `snapshotFrozen: true`
- `reportFrozen: true`
- `validationFrozen: true`
- `mutationPolicy: "append_only"`

### Reason

Historical operational truth should bias toward append-only preservation.

This does not forbid future corrective supersession models, but the first persistence design should not assume silent mutation.

---

## 10. Retrieval Block Specification

The retrieval block should preserve query-oriented keys.

Recommended minimum fields:

- `organizationId`
- `siteId`
- `sectorType`
- `weekId`
- `calendarYear`
- `weekNumber`
- `snapshotId`
- `twinId`
- `persistedBundleId`

Recommended structure:

    retrieval
    ├── organizationId
    ├── siteId
    ├── sectorType
    ├── weekId
    ├── calendarYear
    ├── weekNumber
    ├── snapshotId
    ├── twinId
    └── persistedBundleId

### Reason

The persistence model should not require full bundle scans to find stored records.

---

## 11. StorageMeta Block Specification

The storage metadata block should preserve storage-side information only.

Recommended minimum fields:

- `storageBackend`
- `storagePath`
- `recordFormat`
- `storedBy`
- `integrityCheckStatus`

Example meanings:

- `storageBackend`: filesystem, database, object_store
- `storagePath`: current storage location or record pointer
- `recordFormat`: json
- `storedBy`: adapter or system actor
- `integrityCheckStatus`: passed, unknown, failed

### Rule

Storage metadata must not become a truth source.

It is operational metadata only.

---

## 12. Canonical `persistedBundleId` Principle

The system should eventually define a deterministic persisted bundle ID.

Recommended principle:

`persistedBundleId` should be derived from stable operational identity plus bundle role, not from random naming alone.

Example conceptual pattern:

    pbr::<organizationId>::<siteId>::<weekId>::<bundleVersion>

Example:

    pbr::org-sintergia-demo::site-004::2026-W11::1.0.0

The exact string format may later be refined, but the ID should be:

- deterministic
- human-inspectable
- stable enough for retrieval
- distinct from snapshot ID

---

## 13. Immutable vs Evolvable Zones

### 13.1 Must Be Treated As Immutable After Persistence

- normalized payload
- metrics
- signals
- twin
- snapshot
- weekly report content for that persisted record
- validation context captured at persistence time
- identity block values linked to that persisted record

### 13.2 May Evolve In Future Envelope Versions

- storage metadata
- storage backend details
- retrieval helpers
- envelope-level metadata
- non-semantic indexing additions

### Rule

Future extension may enrich the persistence envelope.

It must not silently rewrite historical truth.

---

## 14. What Should Be Stored Inline

The first persistence implementation should store these inline inside the persisted record:

- identity block
- bundle
- immutability block
- retrieval block
- storageMeta block

### Why

The system is still early enough that storing the whole record inline is simpler, clearer, and safer than prematurely splitting references across multiple storage layers.

---

## 15. What May Later Be Externalized

Later implementations may choose to externalize or separately index:

- heavy artifact files
- report render variants
- future binary exports
- future bundle hashes
- future audit logs

But the initial persistence implementation should not externalize core truth content.

---

## 16. Forbidden Persistence Envelope Errors

The following are not allowed:

- persisted record without bundle
- persisted record with report but no snapshot
- persisted record with artifact references but no truth objects
- persisted record with mutable in-place snapshot rewriting
- persisted record where retrieval fields contradict unitKey
- persisted record where identity block contradicts bundle IDs
- persisted record that drops validation context
- persisted record that flattens the bundle into presentation-first fields only

Those patterns would destroy durable trust.

---

## 17. Example Conceptual Envelope

A conceptual persisted record would look like this:

    persistedBundleRecord
    ├── persistedBundleId: pbr::...
    ├── persistenceVersion: 1.0.0
    ├── recordStatus: active
    ├── createdAt: ...
    ├── storedAt: ...
    ├── unitKey: ...
    ├── identity:
    │   ├── bundleType
    │   ├── bundleVersion
    │   ├── snapshotId
    │   ├── twinId
    │   ├── reportId
    │   └── scenarioFile
    ├── bundle: { ...canonical diagnostic bundle... }
    ├── immutability:
    │   ├── bundleFrozen
    │   ├── snapshotFrozen
    │   ├── reportFrozen
    │   ├── validationFrozen
    │   └── mutationPolicy
    ├── retrieval:
    │   ├── organizationId
    │   ├── siteId
    │   ├── sectorType
    │   ├── weekId
    │   ├── calendarYear
    │   ├── weekNumber
    │   ├── snapshotId
    │   ├── twinId
    │   └── persistedBundleId
    └── storageMeta:
        ├── storageBackend
        ├── storagePath
        ├── recordFormat
        ├── storedBy
        └── integrityCheckStatus

This is the intended persistence envelope shape.

---

## 18. Recommended Immediate Next Deliverables

After this specification, the next practical deliverables should likely be:

### Deliverable 1 — Persistence Identity Rules Doc

A narrower document or implementation note locking the first `persistedBundleId` pattern.

### Deliverable 2 — Persistence Adapter Type

A minimal interface for storing and loading persisted bundle records.

### Deliverable 3 — First Filesystem Persistence Adapter

A thin adapter that stores the persisted envelope in a stable folder structure.

### Deliverable 4 — Persistence Check Script

A script that validates persisted records just as bundle-check validates assembled bundles.

These are the correct next practical steps.

---

## 19. Architectural Judgment

This specification is now justified because the system already has a stable enough bundle to deserve durable storage.

Without this envelope, persistence implementation would likely drift into:

- file dumping
- unclear IDs
- mixed truth/projection semantics
- weak replay guarantees

This envelope prevents that.

---

## 20. Summary

The persisted bundle record must not be treated as an arbitrary saved JSON.

It must be treated as a formal storage envelope around a canonical diagnostic bundle.

That envelope must preserve:

- identity
- truth
- projection boundaries
- retrieval keys
- immutability rules
- storage metadata
- validation trust

That is the correct persistence foundation for Phase 3.
# PHASE 3 PERSISTENCE IDENTITY RULES

Canonical identity rules for persisted diagnostic bundle records in the NEXUS™ persistence layer.

---

## 1. Purpose

This document defines how persisted diagnostic bundle records are uniquely identified inside the NEXUS™ persistence layer.

Its purpose is to prevent identity drift before persistence implementation begins.

Without explicit identity rules, the system would risk:

- duplicate persisted records
- unclear retrieval paths
- unstable run references
- bundle IDs that are not deterministic
- confusion between snapshot identity and persistence identity

This document exists to ensure that persisted bundle identity is structurally clear before storage adapters are implemented.

---

## 2. Core Principle

A persisted bundle record must have its own canonical persistence identity.

That identity must be:

- deterministic
- stable enough for retrieval
- distinct from snapshot identity
- derived from real operational context
- compatible with future versioning
- human-inspectable

The persistence identity must not be random by default.

Random IDs may exist later for internal storage systems, but the canonical persistence identity should remain structurally meaningful.

---

## 3. Identity Layers

The system now operates with multiple identity layers that must remain distinct.

### 3.1 Payload Identity

Represents the normalized diagnostic input lineage.

Example:

- `payloadId`

### 3.2 Twin Identity

Represents the operational truth object for the run.

Example:

- `twinId`

### 3.3 Snapshot Identity

Represents the frozen evidence object for the run.

Example:

- `snapshotId`

### 3.4 Report Identity

Represents the projection object for the run.

Example:

- `reportId`

### 3.5 Bundle Identity

Represents the packaging identity of the assembled diagnostic bundle.

Currently this exists implicitly through bundle content and scenario assembly context.

### 3.6 Persisted Bundle Identity

Represents the durable storage identity of the persisted record.

Example:

- `persistedBundleId`

This is the identity layer defined by this document.

---

## 4. Identity Separation Rule

The following identities must not be collapsed into one another:

- `snapshotId`
- `twinId`
- `reportId`
- `persistedBundleId`

### Reason

They do different jobs:

- `twinId` identifies truth state
- `snapshotId` identifies frozen evidence
- `reportId` identifies projection output
- `persistedBundleId` identifies the stored bundle record

These must remain related, but distinct.

---

## 5. Canonical Persistence Identity Rule

The system should define a deterministic `persistedBundleId` using stable operational context plus persistence role.

Recommended conceptual structure:

    pbr::<organizationId>::<siteId>::<weekId>::<bundleVersion>

Where:

- `pbr` = persisted bundle record
- `organizationId` = organization identity
- `siteId` = site identity
- `weekId` = operational week identity
- `bundleVersion` = bundle schema version stored in the persisted record

This creates a readable, stable, context-derived persistence identity.

---

## 6. Canonical Example

Example:

    pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0

This is valid conceptually if:

- the bundle belongs to `org-sintergia-demo`
- the site is `site-004`
- the week is `site-004::2026-W11`
- the bundle version is `1.0.0`

The exact string format may later be refined slightly, but the structural principle should remain unchanged.

---

## 7. Required Identity Inputs

The following fields should be treated as the minimum required inputs for generating a canonical `persistedBundleId`:

- `organizationId`
- `siteId`
- `operationalWeek.weekId`
- `bundleVersion`

These should be derived from the bundle itself, not provided as arbitrary external strings.

### Reason

The persisted identity should emerge from canonical bundle truth, not from operator improvisation.

---

## 8. Why `snapshotId` Alone Is Not Enough

Using only `snapshotId` as the persistence identity is not recommended.

### Why not

Because `snapshotId` identifies the evidence object, not the storage envelope.

The system should preserve the distinction between:

- the thing being stored
- and the stored record that contains it

The persisted envelope may later contain metadata or versioning context beyond the snapshot itself.

That is why `persistedBundleId` should remain its own identity.

---

## 9. Why Random UUID-Only Identity Is Not Recommended As Canonical

A random UUID may be acceptable later as a storage backend internal identifier.

But it should not be the only canonical persistence identity.

### Reason

A canonical identity should support:

- human inspection
- deterministic reconstruction
- retrieval predictability
- structural debugging
- easier validation across layers

Pure randomness weakens that.

Recommended approach:

- deterministic canonical ID
- optional backend-specific surrogate ID later if needed

---

## 10. Identity Stability Rule

Once a persisted record has been stored, its `persistedBundleId` must be treated as stable and immutable.

This means:

- it must not be regenerated differently later for the same stored record
- it must not change because of presentation metadata
- it must not change because of storage location changes
- it must not change because of downstream delivery activity

The persistence identity belongs to the stored record, not to its surrounding infrastructure.

---

## 11. Identity Immutability Inputs

The fields used to generate `persistedBundleId` should themselves be treated as persistence-critical.

These include:

- `organizationId`
- `siteId`
- `weekId`
- `bundleVersion`

If any of those change materially, the system should treat the result as a different persisted record identity.

---

## 12. Re-Persistence Rule

If the same canonical bundle is stored again without semantic change, the system should not generate a new canonical `persistedBundleId`.

### Expected behavior

Same bundle identity inputs  
→ same canonical `persistedBundleId`

This supports deterministic re-persistence and idempotent storage behavior.

---

## 13. Supersession Rule

If a future run produces a semantically different bundle for the same site/week context, the system must decide whether this is:

- a replacement
- a superseding record
- or a distinct persisted version

### Current recommendation

Do not silently overwrite canonical persisted truth.

Bias toward one of these:

- append-only supersession
- explicit replacement policy
- versioned persisted records

But do not hide the difference behind the same persistence record without governance.

---

## 14. Collision Avoidance Rule

The persistence identity format should avoid collisions across:

- organizations
- sites
- weeks
- bundle versions

That is why the minimum canonical input set includes all of those fields.

### Rule

No persistence identity should be derived from:

- site alone
- week alone
- snapshot alone
- bundleVersion alone

Those are insufficiently unique by themselves.

---

## 15. Identity Readability Rule

The canonical persistence identity should remain readable enough that a human can infer at least:

- which organization it belongs to
- which site it belongs to
- which week it belongs to
- which bundle version it belongs to

This supports operational debugging and governance review.

---

## 16. Identity Validation Rules

A `persistedBundleId` should be considered structurally valid only if:

- it is non-empty
- it follows the expected prefix rule
- it includes the required identity inputs
- it matches the actual bundle unit context
- it matches the actual bundle version
- it does not contradict snapshot-linked context

### Minimum prefix rule

Recommended:

    pbr::

This keeps persistence IDs distinguishable from:

- payload IDs
- twin IDs
- snapshot IDs
- report IDs

---

## 17. Relationship To Retrieval Keys

The `persistedBundleId` is the primary persistence identity.

But it should not be the only retrieval key.

The system should also support lookup through:

- `organizationId`
- `siteId`
- `sectorType`
- `weekId`
- `calendarYear`
- `weekNumber`
- `snapshotId`
- `twinId`

### Reason

Primary identity and retrieval convenience are related, but not identical concerns.

---

## 18. Relationship To Persistence Envelope

Inside the persisted bundle record, the identity relationship should remain:

    persistedBundleRecord
    ├── persistedBundleId
    ├── identity.snapshotId
    ├── identity.twinId
    ├── identity.reportId
    └── bundle.bundleVersion

This keeps identity layers explicit and non-collapsed.

---

## 19. Forbidden Identity Errors

The following are not allowed:

- using `snapshotId` as the only persistence identity without distinction
- generating random canonical IDs with no structural meaning
- generating different canonical IDs for the same unchanged bundle
- changing `persistedBundleId` after storage
- generating IDs from non-canonical external strings
- allowing persisted identity to contradict bundle unitKey
- allowing persisted identity to contradict bundle version
- allowing two distinct persisted records to share the same canonical persistence identity without explicit versioning policy

These would weaken persistence integrity.

---

## 20. Recommended First Implementation Rule

The first persistence implementation should use one simple canonical ID rule only.

Recommended first rule:

    persistedBundleId =
    pbr::<organizationId>::<siteId>::<weekId>::<bundleVersion>

Do not overcomplicate identity generation in the first pass.

First priority:

- determinism
- clarity
- stability

---

## 21. Recommended Next Deliverables

After this identity rule document, the next practical deliverables should be:

### Deliverable 1 — Persistence Adapter Type

A minimal storage adapter interface that accepts and returns persisted bundle records.

### Deliverable 2 — Persisted Bundle Record Type

A formal TypeScript type for the persistence envelope.

### Deliverable 3 — Filesystem Persistence Adapter

A first implementation using the canonical persistence identity as the storage key.

### Deliverable 4 — Persistence Check Script

A script that validates persisted envelope integrity and identity coherence.

---

## 22. Summary

The persistence layer must not invent identity casually.

It must preserve a distinct and deterministic canonical identity for the persisted bundle record.

That identity should be:

- separate from snapshot identity
- derived from canonical operational context
- stable under re-persistence
- readable
- version-aware
- suitable for retrieval and governance

That is the correct identity foundation for Phase 3 persistence.
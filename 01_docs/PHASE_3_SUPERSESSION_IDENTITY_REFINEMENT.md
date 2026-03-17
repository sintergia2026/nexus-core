# PHASE 3 SUPERSESSION IDENTITY REFINEMENT

Identity refinement rules for persisted bundle records once supersession becomes part of the NEXUS™ persistence layer.

---

## 1. Purpose

This document defines how persisted bundle identity should evolve once the system begins preserving multiple records for the same operational context.

Its purpose is to solve the next structural problem created by successful first-cycle persistence:

the current persisted identity works for initial storage, but it is not sufficient once more than one materially distinct persisted record may exist for the same context.

This document exists to refine persistence identity before supersession implementation begins.

---

## 2. Current Identity Limitation

The current canonical persistence identity is:

    pbr::<organizationId>::<siteId>::<weekId>::<bundleVersion>

This is acceptable for the first persistence cycle because it gives the system:

- deterministic identity
- readable identity
- context-linked identity
- stable single-record storage

But it becomes insufficient when the system must preserve:

- more than one persisted record
- for the same organization
- for the same site
- for the same week
- under the same bundle version

At that point, identity must become revision-aware.

---

## 3. Core Principle

Supersession must preserve both:

- historical distinctness
- governing clarity

That means every materially distinct persisted record must receive its own persisted identity.

The system must not reuse the same canonical identity for multiple distinct stored records.

This means persistence identity must evolve from:

- context identity only

to:

- context identity plus governed revision identity

---

## 4. Recommended Refined Identity Pattern

The recommended refined persistence identity pattern is:

    pbr::<organizationId>::<siteId>::<weekId>::<bundleVersion>::rev-<NNNN>

Example:

    pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0001

Future superseding example:

    pbr::org-sintergia-demo::site-004::site-004::2026-W11::1.0.0::rev-0002

This is the recommended canonical direction.

---

## 5. Why Revision Suffix Is Preferred

The revision suffix is recommended over timestamp-first or UUID-first identity refinement.

### Reasons

It is:

- human-readable
- governance-friendly
- sequence-aware
- easy to compare
- easy to sort
- better for audit than random suffixes
- more stable than timestamp-heavy naming

This is especially important for institutional review.

A reviewer should be able to understand immediately which record is earlier and which is later.

---

## 6. Canonical Meaning Of Revision

The revision suffix represents:

the ordinal persisted record sequence for a given canonical operational context and bundle version.

It does not mean arbitrary edit count.  
It means governed persisted-record order for that context.

So:

- `rev-0001` = first persisted record for that context
- `rev-0002` = second persisted record for that context
- `rev-0003` = third persisted record for that context

This is the most governable interpretation.

---

## 7. Canonical Context Under Revision

The revision sequence should be scoped by:

- `organizationId`
- `siteId`
- `weekId`
- `bundleVersion`

This means revision numbers are not global.

They are local to the same operational context and bundle version family.

This is important because revision should express sequence within the same governing record domain, not across unrelated records.

---

## 8. Revision Format Rule

The recommended revision format is:

    rev-0001

With zero-padded numeric width.

Recommended initial width:

- 4 digits

Examples:

- `rev-0001`
- `rev-0002`
- `rev-0010`
- `rev-0100`

### Reason

Zero-padding improves:

- lexical sorting
- readability
- future scaling

---

## 9. Refined Identity Rule

Under supersession-aware persistence, the canonical persisted identity should become:

    persistedBundleId =
    pbr::<organizationId>::<siteId>::<weekId>::<bundleVersion>::rev-<NNNN>

This refined identity should replace the current context-only form once supersession is implemented.

---

## 10. Why Timestamp Suffix Is Not Preferred As Canonical

A timestamp suffix may appear attractive because it guarantees uniqueness.

Example rejected pattern:

    pbr::...::20260317T074350Z

This is not preferred as canonical because it weakens:

- readability
- revision meaning
- governance interpretation
- explicit record ordering language

Timestamps may still exist in metadata.

They should not become the primary supersession identity mechanism.

---

## 11. Why UUID Suffix Is Not Preferred As Canonical

A UUID suffix may also guarantee uniqueness.

But it weakens:

- inspectability
- determinism
- human governance
- sequence semantics

UUIDs may later exist internally if a backend needs them.

They should not be the canonical persisted record identity.

---

## 12. Relationship Between Revision And Status

Revision order and record status are related but not identical.

Example:

- `rev-0001` may later become `superseded`
- `rev-0002` may become `active`

This means revision captures record order, while status captures governance role.

Both must remain explicit.

---

## 13. One Active Revision Rule

Within the same canonical context:

- `organizationId`
- `siteId`
- `weekId`
- `bundleVersion`

there should still be at most one `active` revision at a time.

Example:

- `rev-0001` = superseded
- `rev-0002` = active

This is the correct governing model.

---

## 14. First Revision Rule

When a context is persisted for the first time under revision-aware identity, the first record should be:

    rev-0001

Not:

- `rev-0000`
- blank revision
- omitted revision
- timestamp-only suffix

This keeps the model simple and explicit from the first stored record onward.

---

## 15. Supersession Transition Rule

When a new governed record supersedes an older one, the recommended behavior is:

1. identify the latest revision for the context
2. assign the next revision number
3. persist the new record under the new revision identity
4. mark the prior active revision as `superseded`
5. mark the newest revision as `active`
6. rebuild the index

This is the correct operational behavior.

---

## 16. Retrieval Rule Under Refined Identity

Once revision-aware identity exists, retrieval should support both:

### 16.1 Direct retrieval by exact persistedBundleId

Example:

- fetch `rev-0002` exactly

### 16.2 Context retrieval across revisions

Example:

- fetch all records for:
  - `organizationId`
  - `siteId`
  - `weekId`

This allows both:

- precise record retrieval
- historical lineage retrieval

---

## 17. Backward Compatibility Rule

The system may already contain records stored under the older identity format without revision suffix.

This must be handled carefully.

### Recommended interpretation

Existing pre-revision records should be treated conceptually as first-generation records.

Later migration options may include:

- treating them as implicit `rev-0001`
- migrating filenames and IDs explicitly
- preserving legacy IDs with compatibility handling

This decision can be deferred, but it must be acknowledged.

---

## 18. Recommended Migration Bias

The recommended future bias is:

- preserve legacy first-cycle records
- map them conceptually to first revision
- adopt revision-aware identity for all new supersession-capable persistence operations

This avoids discarding prior work while allowing the model to mature.

---

## 19. Forbidden Identity Refinement Errors

The following are not allowed:

- reusing the same persistedBundleId for materially different records
- adding random suffixes with no governance meaning
- mixing timestamp suffixes and revision suffixes as competing canonical schemes
- assigning multiple active records under the same context and revision family without governance
- allowing revision sequence gaps without explanation
- changing a record’s revision after it has been persisted

These would weaken persistence trust and auditability.

---

## 20. Recommended Next Technical Consequence

Once this refinement is accepted, the next implementation step should be:

- revise `buildPersistedBundleId`
- add context-aware revision discovery
- persist new records with revision suffix
- eventually implement supersession-aware persistence workflow

This is the natural bridge from policy to code.

---

## 21. Summary

The first-cycle persisted identity was sufficient for initial persistence.

It is not sufficient for supersession-capable persistence.

The correct refinement is to make persisted bundle identity revision-aware through a canonical suffix:

    ::rev-0001
    ::rev-0002
    ::rev-0003

This gives the system:

- historical distinctness
- governing clarity
- auditability
- retrieval order
- structural maturity

That is the correct identity foundation for supersession-ready persistence.
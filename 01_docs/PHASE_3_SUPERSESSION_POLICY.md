# PHASE 3 SUPERSESSION POLICY

Canonical supersession policy for persisted diagnostic bundle records in the NEXUS™ persistence layer.

---

## 1. Purpose

This document defines what must happen when more than one persisted bundle record exists for the same operational context.

Its purpose is to prevent silent ambiguity in the persistence layer.

Without a supersession policy, the system would risk:

- multiple active records for the same site/week context
- unclear retrieval truth
- accidental overwrite behavior
- loss of historical auditability
- unstable persistence trust

This document exists to make persistence behavior governable before multi-record history becomes common.

---

## 2. Core Principle

Persistence must preserve history without allowing truth ambiguity.

That means the system must support both:

- historical preservation
- operational clarity

The persistence layer must not silently erase older records.  
It must also not leave multiple conflicting records marked as equally active for the same canonical context unless that is explicitly allowed by governance.

---

## 3. What Supersession Means

Supersession means:

a newer persisted record becomes the current governing record for a given operational context, while the prior record remains preserved but no longer active.

This is different from deletion.

Supersession preserves history.

---

## 4. Canonical Operational Context For Supersession

The default context for supersession should be defined by:

- `organizationId`
- `siteId`
- `weekId`

This means supersession decisions are made within the same:

- organization
- site
- operational week

Not globally across unrelated records.

---

## 5. Canonical Record Status Values

The persistence layer currently supports:

- `active`
- `superseded`
- `archived`

These should mean the following.

### 5.1 `active`

The current governing persisted record for its context.

### 5.2 `superseded`

A historical record that was once valid but has been replaced by a later governing record for the same context.

### 5.3 `archived`

A preserved record intentionally retained outside the active operational surface, without necessarily implying direct replacement.

---

## 6. One-Active-Record Rule

For a given canonical context:

- `organizationId`
- `siteId`
- `weekId`

the system should prefer **at most one `active` persisted record**.

This is the default governing rule.

### Reason

Operational retrieval must be able to answer:

which persisted record currently governs this context?

without ambiguity.

---

## 7. Append-Only Preservation Rule

Supersession must not delete prior records.

When a newer record supersedes an older one:

- the older one remains preserved
- the older one becomes `superseded`
- the newer one becomes `active`

This preserves replayability and audit trail.

---

## 8. No Silent Overwrite Rule

The persistence layer must not silently overwrite an existing persisted record for the same context and pretend history never existed.

If a new record is introduced for a context that already has an `active` record, the system should explicitly do one of the following:

- reject the operation
- require supersession handling
- create a new persisted record and mark the prior one `superseded`

But it must not erase the prior record invisibly.

---

## 9. Canonical Supersession Trigger

A supersession event should be considered when:

- the same `organizationId`
- the same `siteId`
- the same `weekId`

receive a newly persisted record that is intended to govern the same operational context.

This does not automatically mean the new record is valid.

It means the system must apply policy.

---

## 10. Minimum Supersession Questions

Before a record becomes superseding, the system should be able to answer:

- does an `active` record already exist for this context?
- is the incoming record semantically different?
- should the new record replace the old one as the governing record?
- should the prior record remain queryable historically?
- should the transition be explicit in metadata or index status?

These are the minimum governance questions.

---

## 11. Recommended First Policy

The recommended first policy is:

## reject duplicate active persistence unless supersession is explicitly invoked

This means:

- first record for a context may become `active`
- second record for same context should not automatically become another `active`
- system should require explicit supersession handling

This is the safest first behavior.

---

## 12. Recommended First Supersession Behavior

When explicit supersession is allowed, the recommended behavior is:

1. preserve the existing active record
2. mark the existing active record as `superseded`
3. persist the incoming record as `active`
4. rebuild the persistence index
5. preserve both records in history

This is the cleanest first implementation model.

---

## 13. Identity Rule Under Supersession

Supersession must not reuse the exact same persisted record identity if the stored record is materially distinct.

This means a future superseding record should not simply overwrite the same canonical record file while pretending to be the same immutable record.

### Implication

If supersession is implemented, persistence identity may need one more differentiator beyond:

- `organizationId`
- `siteId`
- `weekId`
- `bundleVersion`

For example, future policy may require one of:

- persistence revision suffix
- persisted timestamp suffix
- governed sequence number

This is not yet implemented, but it is structurally important.

---

## 14. Why Current Identity Pattern Is Not Enough For Supersession

The current persistence identity is deterministic and good for first storage:

    pbr::<organizationId>::<siteId>::<weekId>::<bundleVersion>

But if two materially distinct records exist for the same context and same bundle version, this pattern alone is insufficient to distinguish them.

That is acceptable for the first persistence cycle.

But supersession implementation will require an identity extension.

---

## 15. Historical Preservation Rule

Superseded records must remain retrievable.

At minimum, the system should preserve the ability to retrieve records by:

- `persistedBundleId`
- `siteId`
- `weekId`
- `recordStatus`

This ensures superseded records remain part of institutional memory.

---

## 16. Retrieval Rule Under Supersession

Default retrieval behavior should eventually distinguish between:

### 16.1 Governing retrieval

Return the `active` record for a context.

### 16.2 Historical retrieval

Return all records for a context, including `superseded` and `archived`.

This distinction is necessary for future operator clarity.

---

## 17. Forbidden Supersession Errors

The following are not allowed:

- two conflicting records both marked `active` for the same context without explicit governance exception
- silent overwrite of an older persisted record
- deletion of prior historical truth during replacement
- supersession without status transition
- supersession that breaks index coherence
- supersession that reuses identity in a way that destroys auditability
- supersession that hides historical records from explicit historical retrieval

These would weaken persistence trust.

---

## 18. Recommended Next Technical Implications

When supersession is implemented, the following will likely be required:

- context lookup for existing active records
- status mutation path for prior records
- new persisted identity refinement
- index rebuild after supersession
- explicit supersession command or governed adapter behavior

These are the practical implementation consequences of this policy.

---

## 19. Current Phase 3 Position Relative To Supersession

Supersession is not yet implemented.

Current persistence behavior is still first-cycle persistence, not governed replacement.

That is acceptable.

But now that:

- persist works
- load works
- check works
- index works
- query works

supersession has become the next real structural problem.

---

## 20. Summary

The persistence layer must preserve both:

- historical truth
- governing clarity

The correct default rule is:

- one active record per operational context
- append-only preservation of prior records
- no silent overwrite
- explicit supersession handling when replacement is intended

That is the correct governance foundation for the next persistence maturity step.
# PHASE 1 LOCK

Formal lock declaration for the validated NEXUS™ Phase 1 diagnostic core.

---

## 1. Purpose

This document declares the formal lock state of the validated Phase 1 core.

Its purpose is to prevent accidental mutation of the already validated system nucleus while future architectural work continues.

Phase 1 is now considered structurally validated enough that its core must no longer be modified casually.

This lock exists to protect:

- architectural coherence
- diagnostic consistency
- scenario contrast validity
- output bundle stability
- identity integrity
- test reliability

---

## 2. Lock Principle

Once a phase has reached validated core status, it must stop behaving like an open sketch.

It must become a controlled baseline.

This means that the validated Phase 1 core is no longer the place for:

- casual experimentation
- uncontrolled refactors
- silent semantic changes
- ad hoc metric mutations
- threshold drift without explicit review
- output shape changes without explicit review

Phase 1 is now a reference layer.

---

## 3. What Is Considered Locked

The following elements are considered locked for Phase 1.

### 3.1 Core Flow

The validated Phase 1 operational flow is locked as:

Operational Intake Payload  
→ Normalization  
→ Metric Calculation  
→ Diagnostic Interpretation  
→ Twin State Assembly  
→ Diagnostic Snapshot  
→ Weekly Report

This sequence must not be reordered casually.

---

### 3.2 Core Contracts

The following contract layer is considered locked in semantic role:

- `02_contracts/OperationalWeek.ts`
- `02_contracts/OperationalIntakePayload.ts`
- `02_contracts/MetricDefinition.ts`
- `02_contracts/SignalDefinition.ts`

These may only change through explicit architectural review.

---

### 3.3 Twin Core

The following twin-layer files are considered locked in role and identity behavior:

- `04_twin/types/TwinState.ts`
- `04_twin/types/DiagnosticSnapshot.ts`
- `04_twin/twin_builder/build_twin.ts`

This includes:

- twin identity logic
- snapshot identity logic
- twin-to-snapshot referential structure

---

### 3.4 Engine Core

The following engine components are considered locked in their current validated role:

- `05_engine/normalization/normalization_engine.ts`
- `05_engine/normalization/normalization_rules.ts`
- `05_engine/metrics/metrics_engine.ts`
- `05_engine/diagnostics/diagnostic_engine.ts`
- `05_engine/orchestration/run_diagnostic.ts`
- `05_engine/types/WeeklyReport.ts`
- `05_engine/reporting/weekly/weekly_report_builder.ts`

This does not mean they can never evolve.  
It means they cannot be changed casually or silently.

---

### 3.5 Validated Example Scenarios

The following example payloads are part of the Phase 1 validation baseline:

- `10_examples/intake_payloads/sample_restaurant_week.json`
- `10_examples/intake_payloads/sample_restaurant_week_stable.json`
- `10_examples/intake_payloads/sample_restaurant_week_degraded.json`

These three scenarios now form the minimum contrast reference set.

---

### 3.6 Validation Paths

The following validation paths are considered part of the locked baseline:

- `npm run typecheck`
- `npm run phase1:test`
- `npm run phase1:contrast`

If a change breaks one of these, the burden of proof is on the change, not on the baseline.

---

## 4. What The Lock Does Not Mean

The Phase 1 lock does not mean:

- the system is finished
- the formulas are eternally perfect
- the architecture cannot evolve
- the engine will never be recalibrated
- no future improvements are allowed

The lock means only this:

**changes to the validated Phase 1 core must now be deliberate, explicit, and justified.**

---

## 5. Allowed Changes Under Lock

The following kinds of changes are still allowed under the lock, but only with care:

- bug fixes
- typo fixes
- explicit threshold recalibration with rationale
- explicit output wording refinement
- explicit contract clarification
- test strengthening
- artifact generation hardening

Allowed does not mean casual.  
Allowed means controlled.

---

## 6. Forbidden Change Behavior

The following behaviors are explicitly disallowed while Phase 1 is locked:

- changing metric semantics without review
- renaming output objects without review
- changing twin identity patterns silently
- altering snapshot structure silently
- changing scenario expectations silently
- mutating decision labels casually
- breaking contrast validation without explicit replacement logic
- expanding output bundle contents without canonization

This lock exists specifically to block this type of drift.

---

## 7. Lock Validation Standard

A change touching the locked Phase 1 core should be treated as acceptable only if all of the following remain true:

- `npm run typecheck` passes
- `npm run phase1:test` passes
- `npm run phase1:contrast` passes
- output bundle integrity remains coherent
- identity references remain coherent
- the architectural role of the changed file remains clear

If these are not true, the change should be rejected or rolled back.

---

## 8. Phase 1 Reference States

The current Phase 1 baseline has validated the following diagnostic contrast outcomes:

### Stable reference
- state: `stable`
- decision: `monitor_and_preserve`
- priority: `P3`

### Constrained reference
- state: `constrained`
- decision: `corrective_focus`
- priority: `P2`

### Degraded reference
- state: `degraded`
- decision: `stabilize_now`
- priority: `P1`

These reference outcomes are part of the current lock baseline.

---

## 9. Locked Deliverables Already Achieved

Phase 1 is considered locked because it already achieved the following:

- executable diagnostic core
- typed system flow
- normalized payload processing
- required metric generation
- signal generation
- twin state generation
- diagnostic snapshot generation
- weekly report generation
- persistent JSON artifact generation
- minimum integration validation
- formal contrast validation across three states

This is sufficient to define a baseline worth protecting.

---

## 10. Relationship To Phase 2

Phase 2 must not begin by destabilizing Phase 1.

Phase 2 must treat Phase 1 as:

- baseline
- reference
- protected operational core
- foundation for disciplined expansion

If Phase 2 work requires breaking the locked Phase 1 core, then the Phase 2 proposal is likely architecturally premature or badly sequenced.

---

## 11. Practical Rule

From this point forward, the default assumption is:

**do not modify the validated Phase 1 core unless there is a concrete reason and a validation path to confirm no drift was introduced.**

That is the operational meaning of the lock.

---

## 12. Summary

Phase 1 is now locked as the validated baseline of the NEXUS™ diagnostic core.

It remains evolvable, but no longer casually mutable.

Its role now is to provide:

- a trusted system nucleus
- a stable contrast-validated reference
- a protected base for Phase 2 design and controlled future expansion
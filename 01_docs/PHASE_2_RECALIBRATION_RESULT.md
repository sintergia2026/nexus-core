# PHASE 2 RECALIBRATION RESULT

Result record for the first controlled recalibration pass executed after the validated lock of the NEXUS™ Phase 1 diagnostic core.

---

## 1. Purpose

This document records the outcome of the first controlled recalibration pass executed during Phase 2 exploratory refinement.

Its purpose is to preserve:

- what was changed
- what was not changed
- which validation gates were executed
- what result was achieved

This document exists to prevent future ambiguity about whether the first recalibration pass actually happened, what it targeted, and whether it remained within disciplined scope.

---

## 2. Reason This Recalibration Pass Was Performed

The first recalibration pass was justified by a repeated mismatch pattern observed in Phase 2 candidate scenarios related to severe revenue leakage.

Before recalibration:

### Leakage-heavy case

Observed:

- `recovering`
- `monitor_and_preserve`
- `P3`

Architectural judgment:

- too weak
- severe isolated leakage was being underweighted

### Leakage-heavy with coordination noise case

Observed:

- `degraded`
- `stabilize_now`
- `P1`

Architectural judgment:

- too harsh
- the classifier escalated too abruptly once slight structural friction appeared

These two cases indicated that current propagation and state classification around severe leakage were not proportionate.

---

## 3. Scope Of The First Recalibration Pass

The first recalibration pass was intentionally narrow.

### Layers touched

- constraint derivation logic
- state classification logic

### Layers not touched

- raw signal threshold logic
- decision mapping logic
- reporting projection structure
- twin identity logic
- snapshot identity logic
- output bundle structure
- baseline manifest structure

This pass was intentionally limited to the smallest set of layers necessary to improve proportionality.

---

## 4. What Was Changed

### 4.1 Constraint Propagation Adjustment

A minimal structural propagation path was introduced so that isolated `CRITICAL` leakage could generate a meaningful coordination/control consequence even when latency was not active.

This allowed the system to stop treating critical leakage as a near-passive condition.

### 4.2 State Classification Adjustment

The state classifier was adjusted so that:

- isolated critical leakage with one moderate propagated consequence could be classified as `constrained`
- critical leakage plus mild coordination/friction would no longer jump automatically to `degraded`
- the classifier would behave more proportionally in the middle range between weak recovery and hard degradation

This was the core interpretive correction of the pass.

---

## 5. What Was Not Changed

The following were intentionally left unchanged:

- leakage signal severity thresholds
- reporting signal thresholds
- latency signal thresholds
- decision output mapping
- weekly report structure
- output artifact structure
- baseline scenario definitions

This confirms that the pass remained disciplined and did not mutate unrelated system behavior.

---

## 6. Validation Gates Executed

The first recalibration pass was accepted only after the following gates were executed.

### Gate 1 — Type Safety

```bash
npm run typecheck
```

Result:

- passed

### Gate 2 — Locked Baseline Protection

```bash
npm run phase1:contrast
```

Result:

- passed
- all 3 locked baseline scenarios remained intact

### Gate 3 — Candidate Review

```bash
npm run phase2:candidates
```

Result before recalibration:

- 2 mismatches

Result after recalibration:

- 0 mismatches

### Gate 4 — Manual Scenario Inspection

```bash
npm run phase1:demo:summary -- sample_restaurant_week_leakage_heavy.json
npm run phase1:demo:summary -- sample_restaurant_week_leakage_heavy_coordination_noise.json
```

Result:

- both scenarios now resolved to a proportional corrective middle state

---

## 7. Final Observed Result

### Leakage-heavy case

Final observed result:

- `constrained`
- `corrective_focus`
- `P2`

Interpretation:

The previously underweighted severe isolated leakage case was corrected into a more proportionate middle posture.

### Leakage-heavy with coordination noise case

Final observed result:

- `constrained`
- `corrective_focus`
- `P2`

Interpretation:

The previously over-escalated case was softened into a more proportionate corrective middle posture.

---

## 8. Architectural Judgment

The first recalibration pass is considered successful.

Reasoning:

- it solved the current observed mismatches
- it preserved the locked baseline
- it did not mutate the output structure
- it corrected proportionality at the correct layers
- it avoided broader uncontrolled engine drift

This is the kind of recalibration the system should allow:
narrow, justified, and validated.

---

## 9. Current Status After Recalibration Pass 1

After this pass, the repository now has:

- locked Phase 1 baseline still protected
- validated exploratory candidate scenarios aligned with expected proportional outcome
- a proven recalibration workflow
- evidence that controlled diagnostic refinement can happen without destabilizing the system core

This strengthens confidence in future Phase 2 work.

---

## 10. What Should Happen Next

No immediate additional recalibration is required.

The correct next posture is:

- pause further engine mutation
- preserve this result
- continue controlled observation only if new evidence appears
- avoid unnecessary tuning after a successful pass

Further recalibration should happen only if new candidate mismatches appear.

---

## 11. Summary

The first controlled Phase 2 recalibration pass was executed successfully.

It:

- corrected leakage-related proportionality issues
- preserved the locked baseline
- passed all validation gates
- reduced candidate mismatches from 2 to 0

This result is now part of the architectural record.
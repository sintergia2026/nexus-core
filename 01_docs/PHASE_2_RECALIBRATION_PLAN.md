# PHASE 2 RECALIBRATION PLAN

Controlled intervention plan for future recalibration work after the validated lock of the NEXUS™ Phase 1 diagnostic core.

---

## 1. Purpose

This document defines the first disciplined recalibration plan for the NEXUS™ diagnostic core.

Its purpose is not to authorize arbitrary engine mutation.  
Its purpose is to define a narrow intervention path based on already observed mismatches, while preserving the locked Phase 1 baseline.

This plan exists to ensure that recalibration is:

- narrow
- evidence-based
- reversible
- testable
- structurally justified

---

## 2. Current Trigger For Recalibration Planning

This plan exists because the current exploratory Phase 2 candidate review revealed two meaningful mismatches.

### Candidate mismatch 1

Scenario:

- `sample_restaurant_week_leakage_heavy.json`

Expected:

- `constrained`
- `corrective_focus`
- `P2`

Observed:

- `recovering`
- `monitor_and_preserve`
- `P3`

Interpretation:

This suggests under-propagation of severe isolated leakage.

---

### Candidate mismatch 2

Scenario:

- `sample_restaurant_week_leakage_heavy_coordination_noise.json`

Expected:

- `constrained`
- `corrective_focus`
- `P2`

Observed:

- `degraded`
- `stabilize_now`
- `P1`

Interpretation:

This suggests over-escalation once slight structural friction appears alongside severe leakage.

---

## 3. Recalibration Objective

The objective of recalibration is not to make both candidate cases fit a preconceived narrative.

The objective is to improve the proportionality and continuity of system interpretation when severe economic anomalies appear.

The recalibration goal is:

- reduce underweighting of critical isolated leakage
- reduce abrupt over-escalation when leakage meets mild structural noise
- preserve the locked Phase 1 baseline
- maintain twin/report identity integrity
- avoid broad engine drift

---

## 4. Recalibration Hypothesis

Current evidence suggests the most likely issue is not at the raw signal-severity layer.

The most likely issue is that the engine currently depends too strongly on constraint activation as an escalation gate.

Working hypothesis:

- severe leakage alone does not propagate enough structural consequence
- once structural consequence appears, escalation becomes too sharp
- the classifier may lack a smoother middle zone between isolated anomaly and degraded condition

This hypothesis should guide the first recalibration pass.

---

## 5. Planned Recalibration Order

The first recalibration pass should investigate layers in this order:

### 5.1 Constraint Derivation Layer

Primary question:

Can severe leakage propagate a more appropriate structural consequence without forcing a full degraded outcome?

Why first:

The current mismatch appears to originate in weak structural propagation for isolated leakage.

Target investigation:

- whether severe leakage deserves a dedicated economic/control-related constraint path
- whether current leakage handling is too binary
- whether coordination and flow constraints are currently carrying too much escalation responsibility

---

### 5.2 State Classification Layer

Primary question:

Can the state classifier produce a more proportional state when severe leakage exists with low or moderate supporting friction?

Why second:

State outcome appears downstream of structural propagation.

Target investigation:

- whether isolated severe financial anomalies are underweighted
- whether mild additional friction causes too abrupt a jump to degraded
- whether a more stable middle classification behavior is needed

---

### 5.3 Decision Mapping Layer

Primary question:

Once state and constraint propagation are improved, does the decision posture become more proportional?

Why third:

Decision output should not be tuned before upstream interpretation is reviewed.

Target investigation:

- whether `monitor_and_preserve` is too soft for isolated critical leakage
- whether `stabilize_now` becomes too aggressive once slight coordination noise appears
- whether a better corrective middle posture is needed

---

### 5.4 Signal Threshold Layer

Primary question:

Only if upstream layers fail, should leakage signal generation itself be reconsidered?

Why last:

The signal already reaches `CRITICAL`, so raw detection is not the primary suspected issue.

---

## 6. What Must Not Change In First Pass

The following must not be casually changed in the first recalibration pass:

- Phase 1 locked baseline scenarios
- baseline state expectations
- twin identity structure
- snapshot identity structure
- report identity structure
- output bundle structure
- command workflow
- manifest structure

Recalibration must be interpretive, not architectural demolition.

---

## 7. Validation Gates

Any recalibration proposal must pass these gates.

### Gate 1 — Structural Safety

Must pass:

```bash
npm run typecheck
npm run phase1:test
```

### Gate 2 — Locked Baseline Protection

Must pass:

```bash
npm run phase1:contrast
```

The 3 locked baseline scenarios must remain unchanged unless a formal redesign is approved.

### Gate 3 — Candidate Review Improvement

Must be reviewed with:

```bash
npm run phase2:candidates
```

This command is the primary Phase 2 mismatch review gate.

### Gate 4 — Scenario Inspection

Specific scenarios under review must be manually inspected with:

```bash
npm run phase1:demo:summary -- <scenario-file.json>
```

This ensures the recalibration is not accepted blindly through a single pass/fail number.

---

## 8. Acceptance Criteria For First Recalibration Pass

A first recalibration pass should only be considered acceptable if all of the following are true:

- locked baseline still passes unchanged
- leakage-heavy case becomes more proportionate than `recovering / P3`
- leakage-heavy-with-coordination-noise case becomes more proportionate than an automatic `degraded / P1`, unless evidence clearly justifies it
- no new incoherence is introduced into output structure
- no identity drift is introduced
- no broad unintended behavior appears in existing validated scenarios

---

## 9. Non-Acceptance Conditions

A recalibration pass should be rejected if any of the following happens:

- locked baseline changes unexpectedly
- candidate mismatches are “fixed” by broadening instability everywhere
- state transitions become less interpretable
- decision outputs become semantically weaker or noisier
- the engine becomes harder to reason about than before
- multiple unrelated layers are changed at once without isolation

Recalibration must improve clarity, not just alter outcomes.

---

## 10. Recommended First Technical Intervention Style

The first recalibration pass should be:

- minimal
- isolated
- reversible
- documented
- validated immediately

This means:

- change one layer first
- rerun all gates
- observe outcome
- only then decide whether the next layer should be touched

Do not recalibrate multiple layers in one blind sweep.

---

## 11. Summary

The system now has enough evidence to justify a recalibration plan, but not yet enough justification for uncontrolled changes.

The correct next move is a narrow first-pass investigation focused primarily on:

1. constraint derivation
2. state classification
3. decision mapping

The locked baseline remains protected.

The candidate review remains the main Phase 2 learning surface.

That is the correct basis for disciplined recalibration work.
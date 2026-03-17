# PHASE 2 CALIBRATION NOTES

Observed calibration notes and interpretation gaps identified after the validated closure of the NEXUS™ Phase 1 core.

---

## 1. Purpose

This document records calibration-relevant observations discovered during early Phase 2 exploratory scenario work.

Its purpose is not to authorize immediate engine mutation.  
Its purpose is to preserve observed discrepancies, prevent memory loss, and create a disciplined backlog for future recalibration work.

These notes exist so that observed weaknesses in the current diagnostic behavior are not forgotten, improvised away, or silently patched without architectural review.

---

## 2. Calibration Principle

Once a validated baseline exists, newly observed mismatches should be recorded before they are corrected.

The correct discipline is:

- observe
- record
- compare expected vs observed
- decide whether the discrepancy is acceptable
- only then consider recalibration

This prevents reactive tuning and protects the locked baseline.

---

## 3. Current Status Context

At the time of this note, the following remains true:

- Phase 1 baseline is validated
- Phase 1 baseline is locked
- the locked contrast matrix passes
- the validated extended contrast set includes additional exploratory scenarios
- exploratory scenarios may reveal diagnostic underweighting or overweighting without immediately justifying core mutation

These notes apply within that context.

---

## 4. Observed Calibration Notes

### 4.1 Reporting Failure Scenario

Scenario file:

- `sample_restaurant_week_reporting_failure.json`

Observed behavior:

- state: `degraded`
- decision: `stabilize_now`
- priority: `P1`

Interpretation:

The current engine treats severe reporting collapse as a sufficiently serious structural breakdown to push the system into degraded status even when frontline execution remains mostly stable.

Architectural judgment:

This outcome is currently acceptable and defensible.

Reasoning:

- reporting reliability was critically low
- reporting constraint became critical
- constraint signal became critical
- the system interpreted reporting collapse as an operational truth failure, not merely as a documentation issue

Current handling decision:

- keep as validated
- keep outside locked baseline
- do not recalibrate core based on this scenario alone

---

### 4.2 Leakage Heavy Scenario

Scenario file:

- `sample_restaurant_week_leakage_heavy.json`

Expected architectural intuition before execution:

- expected state: `constrained`
- expected decision: `corrective_focus`
- expected priority: `P2`

Observed behavior:

- observed state: `recovering`
- observed decision: `monitor_and_preserve`
- observed priority: `P3`

Observed signals:

- leakage signal: `CRITICAL`

Observed constraints:

- no active constraints

Interpretation:

The current engine recognizes severe revenue leakage as critical at the signal level, but does not currently allow that single critical condition to propagate strongly enough into state, decision, and priority.

Architectural judgment:

This outcome appears too weak and likely represents an underweighting of severe leakage when it occurs without broader operational instability.

Reasoning:

- severe leakage may represent systemic reconciliation failure
- severe leakage may indicate hidden economic instability even under apparently stable frontline execution
- a critical leakage signal with no stronger corrective posture may understate economic risk

Current handling decision:

- keep as candidate
- do not promote to validated baseline
- do not recalibrate core immediately
- treat this as a Phase 2 calibration backlog item

---

### 4.3 Leakage Heavy With Coordination Noise Scenario

Scenario file:

- `sample_restaurant_week_leakage_heavy_coordination_noise.json`

Expected architectural intuition before execution:

- expected state: `constrained`
- expected decision: `corrective_focus`
- expected priority: `P2`

Observed behavior:

- observed state: `degraded`
- observed decision: `stabilize_now`
- observed priority: `P1`

Observed signals:

- latency signal: `MEDIUM`
- leakage signal: `CRITICAL`
- constraint signal: `CRITICAL`

Observed constraints:

- flow: `MEDIUM`
- coordination: `CRITICAL`

Interpretation:

Once severe leakage is accompanied by even modest structural friction, the current engine escalates aggressively and classifies the system as degraded.

Architectural judgment:

This outcome is stronger than originally expected, but it is structurally informative and defensible under the current logic.

Reasoning:

- the engine appears highly sensitive to the coexistence of critical leakage and active structural constraints
- the presence of coordination degradation appears to unlock a much harsher system posture
- this creates a sharp contrast with the leakage-only case, where severe economic anomaly alone was underweighted

Current handling decision:

- keep as candidate
- do not promote to validated baseline yet
- record as an important comparison case against leakage-only behavior
- use this scenario to study the constraint sensitivity of the current classifier

---

## 5. Current Calibration Backlog

The following calibration questions remain open:

### 5.1 Leakage Propagation Question

Should a `CRITICAL` leakage signal be sufficient, by itself, to force at least:

- a constrained state
- a corrective decision
- a P2 priority

This remains unresolved.

### 5.2 Economic Constraint Question

Should the system introduce an explicit economic or capture-control constraint type for scenarios where revenue leakage is severe but frontline execution remains stable?

This remains unresolved.

### 5.3 State Mapping Sensitivity Question

Is the current state mapping overly dependent on multiple simultaneous constraints and insufficiently sensitive to critical isolated financial anomalies?

This remains unresolved.

### 5.4 Constraint Escalation Question

Is the current engine too discontinuous in its escalation behavior, such that severe leakage alone is underweighted while severe leakage plus slight coordination noise escalates too abruptly?

This remains unresolved.

---

## 6. What Should Not Happen Yet

The following actions are not recommended yet:

- ad hoc threshold patching
- changing decision logic casually
- mutating state classification rules without structured review
- inserting new constraints into the ontology without design justification
- modifying the locked baseline because of exploratory edge cases alone

Exploratory evidence should first accumulate into a coherent recalibration case.

---

## 7. Current Operational Rule

Until a formal recalibration phase is approved, the following rule applies:

- locked baseline behavior remains authoritative
- validated but non-locked scenarios may reveal weaknesses
- candidate scenarios may document expected vs observed mismatches
- observed mismatch does not automatically justify engine mutation

This preserves stability while still allowing learning.

---

## 8. Recommended Next Calibration Path

The next useful calibration work should likely focus on one of the following:

1. adding one or two more economically abnormal scenarios
2. comparing leakage-heavy behavior across multiple operating contexts
3. determining whether severe economic anomalies deserve a new constraint path
4. reviewing whether current decision mapping underweights single-point critical anomalies
5. studying whether mild structural noise produces overly abrupt escalation when paired with critical leakage

This should happen deliberately, not reactively.

---

## 9. Summary

Phase 2 has already revealed several important calibration insights:

- severe reporting collapse is currently treated as sufficiently serious to degrade the system
- severe leakage alone is currently recognized as critical but appears underweighted in final state and decision mapping
- severe leakage plus mild structural friction escalates sharply into degraded status

These observations are now recorded as structured calibration notes rather than informal memory.

That is the correct basis for future recalibration work.
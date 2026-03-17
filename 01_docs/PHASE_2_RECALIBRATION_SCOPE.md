# PHASE 2 RECALIBRATION SCOPE

Scope definition for possible future recalibration work after the validated lock of the NEXUS™ Phase 1 diagnostic core.

---

## 1. Purpose

This document defines the possible scope of future recalibration work inside the NEXUS™ diagnostic core.

Its purpose is not to authorize immediate changes.  
Its purpose is to identify which layers may eventually require recalibration, which layers should remain protected, and how recalibration should be approached without destabilizing the validated baseline.

This document exists to prevent undisciplined tuning.

---

## 2. Recalibration Principle

Recalibration must not be treated as creative freedom.

Recalibration is only legitimate when all of the following are true:

- a mismatch has been observed
- the mismatch has been recorded
- the mismatch has been compared against expected behavior
- the mismatch appears structurally meaningful
- the proposed change can be isolated to a specific layer

The goal of recalibration is not to make outputs “look better.”  
The goal is to improve interpretive fidelity without damaging system coherence.

---

## 3. What Is Not In Scope

The following are explicitly out of recalibration scope at this stage:

- frontend behavior
- API response design
- PDF output formatting
- email delivery
- governance scoring
- maturity scoring
- badge logic
- agent behavior
- multi-sector expansion
- rewriting the Phase 1 baseline around exploratory cases

These are not diagnostic-core recalibration tasks.

---

## 4. Candidate Recalibration Layers

The following layers may become recalibration candidates.

### 4.1 Signal Threshold Layer

Possible question:

Are some signals too weak or too strong relative to the severity they should represent?

Examples:

- leakage signal may be under-propagating despite critical severity
- reporting gap signal may be appropriately severe
- latency signal escalation may or may not need refinement

Possible files affected later:

- signal generation logic
- diagnostic interpretation thresholds
- signal severity mapping rules

This layer should only be touched if observed evidence suggests the signal itself is being assigned incorrectly or too conservatively.

---

### 4.2 Constraint Derivation Layer

Possible question:

Are there important structural conditions the current engine fails to convert into constraints?

Examples:

- severe leakage may deserve explicit economic or control-related constraint handling
- reporting collapse already propagates into reporting constraint
- coordination constraints may currently have disproportionate leverage once activated

Possible files affected later:

- constraint derivation logic
- diagnostic engine interpretation paths
- ontology constraint definitions

This layer should only be touched if evidence suggests the system recognizes an anomaly but fails to give it structural consequence.

---

### 4.3 State Classification Layer

Possible question:

Is the final state classifier underweighting or overweighting certain kinds of anomalies?

Examples:

- leakage-heavy scenario appears underweighted when isolated
- leakage-heavy plus mild coordination noise appears to escalate sharply
- current classifier may rely too heavily on simultaneous active constraints

Possible files affected later:

- state classifier logic
- state transition rules
- twin state assignment logic

This layer should only be touched if evidence shows the signals and constraints are individually reasonable but the final state outcome remains poor.

---

### 4.4 Decision Mapping Layer

Possible question:

Does the system assign decisions and priorities too softly or too harshly relative to the twin state and active conditions?

Examples:

- a case may have a critical anomaly but still receive `monitor_and_preserve`
- a case may receive `stabilize_now` with relatively narrow active damage if constraint escalation is too sharp

Possible files affected later:

- decision output builder
- priority mapping rules
- report summary phrasing tied to decision output

This layer should only be touched if the state seems acceptable but the final recommended posture seems weak or excessive.

---

## 5. Current Evidence Mapped To Recalibration Scope

### 5.1 Reporting Failure Case

Current judgment:

- acceptable under current model

Most likely no immediate recalibration target required.

### 5.2 Leakage Heavy Case

Current judgment:

- likely underweighted

Most likely candidate layers:

- constraint derivation layer
- state classification layer
- decision mapping layer

### 5.3 Leakage Heavy With Coordination Noise Case

Current judgment:

- informative but possibly sharply escalated

Most likely candidate layers:

- state classification layer
- decision mapping layer

This comparison suggests the current engine may be too dependent on active constraint presence as a hard escalation trigger.

---

## 6. What Must Remain Protected

Even if recalibration is later approved, the following must remain protected unless a formal redesign is explicitly authorized:

- Phase 1 locked baseline scenarios
- baseline IDs and identity patterns
- output bundle structure
- twin-snapshot-report referential integrity
- locked validation paths
- canonical contracts unless explicitly revised

Recalibration must improve interpretation, not destroy the baseline architecture.

---

## 7. Current Recalibration Priority Order

If recalibration is eventually approved, the current recommended order of investigation is:

1. constraint derivation layer
2. state classification layer
3. decision mapping layer
4. signal threshold layer

Why this order:

- the leakage-heavy mismatch appears less like raw signal failure and more like weak structural propagation
- the state outcome seems downstream of that propagation
- the decision output seems downstream of the state
- signal severity itself is not the first suspected defect in the leakage-heavy case

This order is provisional and may change if new evidence emerges.

---

## 8. What Should Happen Before Any Recalibration

Before any recalibration work begins, all of the following should happen:

- additional evidence should be gathered if needed
- candidate mismatch cases should be documented in the scenario manifest
- expected vs observed results should be explicit
- the target recalibration layer should be named
- the locked baseline must remain passing before and after changes

No recalibration should happen without a before/after validation path.

---

## 9. Summary

Phase 2 recalibration, if it happens, should be narrow, evidence-based, and layer-specific.

The current evidence suggests that the most likely future recalibration work will involve:

- structural propagation of severe anomalies
- sensitivity of the state classifier to isolated critical conditions
- downstream decision posture

That work is not authorized yet, but the scope is now defined.
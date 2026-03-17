# PHASE 2 BUNDLE DEFINITION

Canonical bundle definition for packaging the NEXUS™ diagnostic core outputs as a coherent operational delivery unit.

---

## 1. Purpose

This document defines what a canonical NEXUS™ diagnostic bundle is.

Its purpose is to move the system beyond isolated output objects and toward a more disciplined packaging model where a completed diagnostic run can be understood, validated, stored, reviewed, and eventually delivered as a single coherent bundle.

This document exists because a system may produce valid objects while still lacking a formal definition of the completed unit those objects belong to.

---

## 2. Core Principle

A bundle is not just a folder with files.

A bundle is the minimum coherent packaging unit of a completed diagnostic run.

A canonical bundle must preserve:

- object completeness
- referential integrity
- operational context
- provenance
- delivery readiness

The goal of bundle definition is not to create decorative grouping.

The goal is to create a stable packaging concept that can later support:

- storage
- replay
- transmission
- validation
- institutional delivery

---

## 3. Current Bundle Scope

The current bundle definition applies to the existing NEXUS™ diagnostic core only.

It does not yet define:

- database persistence bundles
- API transport envelopes
- PDF delivery packages
- email distribution packages
- governance score bundles
- multi-run comparison bundles
- trend bundles
- portfolio-level institutional bundles

This is the bundle definition for the current diagnostic run unit only.

---

## 4. Canonical Bundle Identity

A canonical diagnostic bundle represents:

- one operational unit
- one operational week
- one normalized intake lineage
- one diagnostic interpretation cycle
- one truth state
- one snapshot evidence object
- one report projection

In practical terms, a canonical bundle corresponds to one completed diagnostic run for one site and one week.

---

## 5. Canonical Bundle Components

A canonical bundle must contain, at minimum, the following components:

1. normalized payload
2. metrics
3. signals
4. twin state
5. diagnostic snapshot
6. weekly report
7. artifact references or persisted artifact files
8. validation status context

These components together form the minimum coherent bundle.

---

## 6. Bundle Object Roles

### 6.1 Normalized Payload

Role:

- internal truth-ready input object

Function inside bundle:

- preserves the normalized source of operational interpretation

### 6.2 Metrics

Role:

- computed diagnostic measurement layer

Function inside bundle:

- preserves quantified operational interpretation inputs

### 6.3 Signals

Role:

- interpretive layer between metrics and state

Function inside bundle:

- preserves diagnostic reasoning outputs

### 6.4 Twin State

Role:

- canonical operational truth object for the run

Function inside bundle:

- preserves the live truth state produced by the run

### 6.5 Diagnostic Snapshot

Role:

- frozen evidence object

Function inside bundle:

- preserves replayable historical truth

### 6.6 Weekly Report

Role:

- institutional projection object

Function inside bundle:

- preserves human-facing operational delivery output

### 6.7 Artifact Layer

Role:

- persisted storage layer

Function inside bundle:

- preserves externalized replayable output files

### 6.8 Validation Context

Role:

- structural trust layer

Function inside bundle:

- indicates whether the run passed expected validation pathways

---

## 7. Canonical Bundle Structure

The canonical conceptual structure of a completed bundle is:

```text
bundle
├── normalizedPayload
├── metrics
├── signals
├── twin
├── snapshot
├── weeklyReport
├── artifacts
└── validation
```

This is a conceptual structure definition, not yet a required file serialization format.

---

## 8. Minimum Required Bundle Fields

A canonical bundle should include, at minimum, the following top-level fields:

- `bundleType`
- `bundleVersion`
- `generatedAt`
- `unitKey`
- `normalizedPayload`
- `metrics`
- `signals`
- `twin`
- `snapshot`
- `weeklyReport`
- `artifacts`
- `validation`

These top-level fields define the minimum coherent bundle envelope.

---

## 9. Required Top-Level Bundle Semantics

### 9.1 `bundleType`

Purpose:

- identifies the bundle as a diagnostic run package

Recommended current value:

- `diagnostic_run_bundle`

### 9.2 `bundleVersion`

Purpose:

- tracks the bundle packaging schema version

Recommended current value:

- `1.0.0`

### 9.3 `generatedAt`

Purpose:

- indicates when the bundle object itself was assembled

### 9.4 `unitKey`

Purpose:

- identifies the operational unit and time window represented by the bundle

### 9.5 `artifacts`

Purpose:

- points to persisted output files or records their presence

### 9.6 `validation`

Purpose:

- records the trust context of the bundle assembly

---

## 10. Artifact Layer Definition

The bundle artifact layer should preserve at minimum:

- diagnostic artifact reference
- weekly report artifact reference

Recommended conceptual structure:

```text
artifacts
├── diagnosticArtifact
└── weeklyReportArtifact
```

Each artifact entry should ideally preserve:

- artifact type
- artifact path or artifact ID
- generation status

This does not require remote storage yet.  
Local persisted file references are sufficient for the current phase.

---

## 11. Validation Layer Definition

The validation layer should preserve the bundle’s trust context.

Recommended minimum validation fields:

- `typecheckPassed`
- `baselineContrastPassed`
- `contractsCheckPassed`
- `candidateReviewStatus`

This does not mean every bundle must run every command every time forever.

It means a formal bundle definition should preserve the validation context relevant to its legitimacy.

---

## 12. Bundle Integrity Rules

A canonical bundle is valid only if all of the following remain true:

- required output objects are present
- required object fields are present
- referential integrity remains coherent
- artifact references correspond to the same diagnostic run
- validation context is not contradictory
- weekly report remains downstream of the snapshot
- snapshot remains traceable to normalized payload

If one of these fails, the bundle is incomplete or compromised.

---

## 13. What A Bundle Must Not Become

A canonical bundle must not become:

- a report-only package
- a frontend response object
- a presentation-first document envelope
- a loose collection of unrelated exports
- a bundle that omits truth objects but preserves projections
- a bundle that treats validation as optional decoration

A bundle is a system packaging unit, not a convenience wrapper.

---

## 14. Allowed Future Bundle Extensions

Future bundle extensions may include, if added carefully:

- richer artifact metadata
- integrity metadata
- validation metadata
- distribution metadata
- archival metadata
- bundle classification metadata
- governance linkage metadata

These are allowed only if they remain additive and do not redefine the current bundle identity.

---

## 15. Forbidden Bundle Mutations

The following bundle mutations are not allowed without explicit redesign approval:

- removing normalized payload from the bundle
- removing snapshot from the bundle
- replacing twin with report as truth source
- replacing artifact references with narrative notes only
- removing validation context entirely
- allowing weekly report to exist without snapshot linkage
- flattening the bundle into a presentation-first envelope

These changes would destroy bundle semantics.

---

## 16. Recommended Immediate Bundle Deliverables

The next practical deliverables under this bundle definition should be:

### Deliverable 1 — Bundle Envelope Spec

A concrete definition of the top-level bundle object.

### Deliverable 2 — Artifact Reference Shape

A minimal structure for recording diagnostic and report artifacts.

### Deliverable 3 — Validation Context Shape

A minimal structure for recording bundle trust status.

### Deliverable 4 — Bundle Assembly Script

An eventual executable script that assembles a bundle from a completed run.

This is the natural bridge from definition to implementation.

---

## 17. Success Criteria

This bundle definition should be considered successful if it allows the team to answer:

- what exactly is a completed diagnostic package?
- which objects must travel together?
- how do we distinguish truth objects from projection objects inside a delivery unit?
- how do we preserve validation trust alongside outputs?
- how can future storage or API layers package outputs without semantic confusion?

That is the real purpose of bundle definition.

---

## 18. Summary

The NEXUS™ diagnostic core already produces meaningful canonical objects.

Phase 2 bundle definition ensures those objects can now be treated as a coherent completed unit rather than as a loose collection of outputs.

This strengthens the system by defining:

- packaging identity
- packaging completeness
- packaging integrity
- packaging trust context

That is the correct next layer of Phase 2 structural maturity.
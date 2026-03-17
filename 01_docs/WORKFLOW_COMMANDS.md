# WORKFLOW COMMANDS

Operational command reference for day-to-day work inside `nexus-core`.

---

## 1. Purpose

This document defines the practical command workflow to use while working on the NEXUS™ core repository.

Its purpose is to reduce command confusion, avoid unnecessary noise, and establish a stable operational rhythm for repository validation.

This is not a CI/CD policy.  
This is a working command reference for controlled daily development.

---

## 2. Core Principle

Not every command should be run every time.

Different commands exist for different levels of validation.

The correct discipline is:

- use the lightest command that answers the current question
- use stronger validation only when needed
- preserve speed without sacrificing structural confidence

---

## 3. Daily Command Levels

The working command set currently has four practical levels.

### Level 1 — Type Safety

Use this when you want to verify that the repository still compiles correctly at the TypeScript level.

```bash
npm run typecheck
```

Use it when:

- you edited TypeScript files
- you changed imports
- you changed types
- you want the fastest structural sanity check

---

### Level 2 — Minimum Core Validation

Use this when you want to confirm that the locked Phase 1 core still passes the minimum integration path.

```bash
npm run phase1:test
```

Use it when:

- you touched core logic
- you want to verify the basic pipeline
- you want more confidence than type checking alone

---

### Level 3 — Locked Baseline Contrast Validation

Use this when you want to verify the protected baseline scenarios only.

```bash
npm run phase1:contrast
```

This command validates the locked baseline scenarios defined in the scenario manifest.

Current locked baseline includes:

- constrained reference case
- stable reference case
- degraded reference case

Use it when:

- you touched diagnostic interpretation
- you touched reporting logic
- you touched output structure
- you want to confirm the protected baseline still behaves correctly

---

### Level 4 — Extended Validated Contrast Validation

Use this when you want to validate all scenarios currently marked as validated in the scenario manifest, including non-locked edge cases.

```bash
npm run phase1:contrast:all
```

This command currently includes:

- locked baseline scenarios
- validated but non-locked scenarios such as reporting failure

Use it when:

- you want the strongest scenario validation currently available
- you are reviewing edge-case behavior
- you are checking whether Phase 2 candidate scenarios still behave as expected

---

## 4. Demo Commands

Demo commands are used for manual inspection of a specific scenario output.

### Default constrained demo

```bash
npm run phase1:demo
```

### Stable scenario demo

```bash
npm run phase1:demo -- sample_restaurant_week_stable.json
```

### Degraded scenario demo

```bash
npm run phase1:demo -- sample_restaurant_week_degraded.json
```

### Reporting failure scenario demo

```bash
npm run phase1:demo -- sample_restaurant_week_reporting_failure.json
```

Use demo commands when:

- you want to inspect raw output
- you want to review metrics, signals, constraints, twin, snapshot, or report content
- you want to understand why a scenario is being classified a certain way

Do not use demo commands as the default workflow for every small edit.  
They are noisier and more inspection-oriented.

---

## 5. Recommended Daily Usage

### Fastest safe daily check

```bash
npm run typecheck && npm run phase1:test
```

This should be the default validation path for ordinary work.

---

### Strong baseline check

```bash
npm run typecheck && npm run phase1:contrast
```

Use this when a change may affect Phase 1 baseline behavior.

---

### Strongest current scenario check

```bash
npm run typecheck && npm run phase1:contrast:all
```

Use this when working with scenario behavior, edge cases, or candidate Phase 2 expansion scenarios.

---

## 6. What Not To Do By Default

Do not run the noisiest command path every time unless you actually need it.

Avoid using large demo output as the default feedback loop for every small code edit.

Do not confuse:

- compile success
- integration success
- baseline contrast success
- extended contrast success

They answer different questions.

---

## 7. Practical Interpretation

Use this rule of thumb:

- if you changed structure → run `typecheck`
- if you changed pipeline behavior → run `phase1:test`
- if you changed interpretation logic → run `phase1:contrast`
- if you changed scenario behavior or edge-case assumptions → run `phase1:contrast:all`
- if you need to inspect raw system output → run a `phase1:demo` command

This is the practical operating rhythm.

---

## 8. Current Command Summary

### Structural check
```bash
npm run typecheck
```

### Minimum integration check
```bash
npm run phase1:test
```

### Locked baseline contrast
```bash
npm run phase1:contrast
```

### All validated scenario contrast
```bash
npm run phase1:contrast:all
```

### Scenario output inspection
```bash
npm run phase1:demo
npm run phase1:demo -- sample_restaurant_week_stable.json
npm run phase1:demo -- sample_restaurant_week_degraded.json
npm run phase1:demo -- sample_restaurant_week_reporting_failure.json
```

---

## 9. Summary

The repository now supports a layered command workflow.

This means you do not need to use the heaviest validation path every time.

The correct daily discipline is to choose the lightest command that gives the confidence you actually need, while preserving the protected baseline and the validated scenario set.
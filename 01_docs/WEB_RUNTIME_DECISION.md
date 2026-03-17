# WEB RUNTIME DECISION

Canonical runtime decision for the future NEXUS™ web application layer.

---

## 1. Purpose

This document records the current decision point for the web runtime layer.

Its purpose is to prevent a structural mistake:

attempting framework-native migration before an actual web framework exists inside `07_app`.

At the current state, `07_app` does not yet contain a real framework implementation.

It currently contains only:

- validated standalone consumer artifacts
- view scope documentation
- view data mapping
- a local HTML validation surface

Because of that, the next step is not immediate migration of the validated consumer into a framework-native page.

The next step is choosing and locking the canonical web runtime.

---

## 2. Current Reality

The current `07_app` layer does not yet include:

- Next.js
- React application scaffolding
- Vite
- framework-native routing
- framework-native layouts
- framework-native data fetching surface

This means there is not yet a real host environment into which the validated consumer can be migrated.

That must be acknowledged explicitly.

---

## 3. Decision

The recommended canonical web runtime for NEXUS is:

## Next.js + App Router + TypeScript

This is the selected direction for future framework-native implementation.

---

## 4. Why This Runtime Is Recommended

This runtime is recommended because it supports the kind of system NEXUS is becoming:

- internal operational interfaces
- inspection surfaces
- dashboard-like views
- controlled server/client rendering
- typed route integration
- future authenticated internal surfaces
- scalable architectural growth

It is a better long-term fit than continuing with standalone HTML or inventing ad hoc view serving patterns.

---

## 5. What The Decision Does Not Mean

This decision does not mean the framework-native migration has already happened.

It only means:

- the runtime direction is now chosen
- the next web step should be bootstrap
- later migration should happen inside that runtime

In other words:

runtime choice comes first  
consumer migration comes second

---

## 6. What Should Happen Next

The next practical step should be:

## bootstrap the canonical web runtime inside `07_app`

That bootstrap should create the real host layer for future migration of:

- `internal-records-view`
- future dashboard surfaces
- future diagnostics surfaces
- future governance/admin surfaces

---

## 7. Relationship To The Validated Standalone Consumer

The standalone consumer remains valid and useful.

It should be preserved as:

- a known-good rendering reference
- a behavior baseline
- a migration comparison target

But it is no longer the target architecture.

The target architecture is now a framework-native web application.

---

## 8. Success Condition

This decision should be considered properly executed only when:

1. a real web framework is bootstrapped in `07_app`
2. the framework becomes the canonical host surface
3. the validated standalone consumer can then be migrated into it in a disciplined way

---

## 9. Summary

The current web layer does not yet contain a framework.

Therefore, immediate framework-native migration is not the correct next move.

The correct next move is to lock the web runtime decision and then bootstrap it.

The recommended canonical runtime is:

- Next.js
- App Router
- TypeScript

That is the correct next foundation for the NEXUS web layer.
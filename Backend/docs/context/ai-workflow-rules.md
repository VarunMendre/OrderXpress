# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow.

Context files define what to build, how to build it, and the current state of progress.
Always implement against these specs. Do not infer behavior from scratch.

The source of truth is this priority order:

1. `project-overview.md`
2. `architecture.md`
3. `code-standards.md`
4. `build-plan.md`
5. `progress-tracker.md`

---

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single implementation step
- Each unit must have a matching spec in `build-plan.md` before implementation begins

---

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant context file before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing
- Prefer explicit onboarding and payment state models over inferred behavior

---

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries -> update `architecture.md`
- Storage model decisions -> update `architecture.md`
- Code conventions or standards -> update `code-standards.md`
- Feature scope or product rules -> update `project-overview.md`
- Progress and decisions made -> update `progress-tracker.md`

---

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. Tests or validation for the unit have been run

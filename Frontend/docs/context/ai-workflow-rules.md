# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. Context files define what to build, how to build it, and the current state of progress. Always implement against these specs — do not infer or invent behavior from scratch.

The source of truth is this priority order: `project-overview.md` → `architecture.md` → `code-standards.md` → remaining context files. When in doubt, refer higher.

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single implementation step
- Each unit must have a matching spec in `build-plan.md` before implementation begins

## When to Split Work

Split an implementation step if it combines:

- UI changes and backend service changes
- Multiple unrelated API routes or services (e.g. auth + orders in one step)
- Behavior not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant context file before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing

## Protected Files

Do not modify the following unless explicitly instructed:

- `.git/*` — Git internals
- Any `node_modules/` or build output directories

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries → update `architecture.md`
- Storage model decisions → update `architecture.md`
- Code conventions or standards → update `code-standards.md`
- Feature scope or product rules → update `project-overview.md`
- Library usage patterns → update `library-docs.md`
- UI tokens or component rules → update `ui-tokens.md`, `ui-rules.md`, or `ui-registry.md`
- Progress and decisions made → update `progress-tracker.md`

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. `tsc --noEmit` passes with no type errors

# Phase 00 Prompt - Design Freeze and Scaffolding

**Duration:** 1 week | **Language:** none | **Specs:** - | **Invariants:** I10

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Freeze the specification, scaffold the repository, and pass Gate G0. Write no compiler code this phase.

## Deliverables

- Every point of disagreement with docs/02 resolved and the document amended
- Ten .aegis policies written by hand, with no compiler, proving the syntax is writable
- Repository scaffolded exactly as docs/15 section 2 describes, with make targets present and failing cleanly
- CI wired: build, test, lint, and a placeholder determinism job
- Gate G0 passed: all 87 blocking skills at level 4, with artifacts
- The one-paragraph statement of why AEGIS is not Rego and not BAML, written from memory

## Exit criteria - all must hold

1. docs/02 is frozen and you would defend every line of it
2. The G0 exit exam is complete: six tasks, from scratch, under 90 minutes each
3. make build, make test, and make lint all run and produce sensible output on an empty repository

## Traps specific to this phase

- Starting the lexer early because scaffolding feels unproductive. The specification is the product; code is its shadow.
- Skipping the hand-written policies. They are the only cheap way to find syntax that is unwritable.
- Marking G0 skills complete without artifacts.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P0

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

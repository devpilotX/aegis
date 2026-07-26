# Phase 06 Prompt - Go Frontend and Differential Harness

**Duration:** 4 weeks | **Language:** Go | **Specs:** 01 through 05 | **Invariants:** I2, I9

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Translate v0 into Go function by function, and prove the two implementations agree.

## Deliverables

- Go implementations of token, lexer, ast, parser, desugar, types, check, analysis
- The differential harness running the entire corpus through both implementations
- Determinism harness with all six platform targets
- Map-iteration lint rule failing CI on bare range
- Float-usage lint rule failing CI

## Exit criteria - all must hold

1. Both implementations agree on decision, justification, and diagnostic codes across the whole corpus
2. Determinism harness passes 10,000 iterations byte-identically on six targets
3. CI blocks any commit introducing a float or an unordered map iteration

## Traps specific to this phase

- Rewriting instead of translating. Structural divergence makes mismatches untraceable.
- Refactoring into idiomatic Go before the harness is green.
- Treating a determinism failure as a minor issue. It is Sev-1 and it stops everything else.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P6

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

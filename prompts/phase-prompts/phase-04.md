# Phase 04 Prompt - Type System and Binding

**Duration:** 2 weeks | **Language:** TypeScript | **Specs:** 03-semantics, 04-type-system | **Invariants:** I2, I4, I8, I10

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Desugar, bind, and enforce all nine type rules with bidirectional checking.

## Deliverables

- Desugaring of all three rule forms into the core form, total and span-preserving
- Two-pass binding with scope tree, symbol index, and use-to-declaration links
- Import aliases, export visibility, cycle detection with full path
- Type representation with currency-parameterised Money, Optional, Set, Record, nominal Enum
- Bidirectional infer and check with expectation propagation
- Every AEG-4xxx diagnostic with a golden fixture

## Exit criteria - all must hold

1. All nine type rules are enforced with tests
2. Money[EUR] compared with Money[USD] produces AEG-4101 naming both types and both spans
3. Declaration order provably does not affect meaning

## Traps specific to this phase

- Adding unification variables or global inference. Local inference only, deliberately.
- Allowing implicit numeric widening because it is convenient.
- Letting desugaring lose spans, which silently degrades every later diagnostic.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P4

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

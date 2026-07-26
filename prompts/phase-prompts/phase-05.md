# Phase 05 Prompt - Evaluator and DESIGN FREEZE

**Duration:** 2 weeks | **Language:** TypeScript | **Specs:** 05-static-analysis | **Invariants:** I1, I3, I4, I7, I8

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Complete the first vertical slice: three keywords, end to end, with justification. Then freeze the design.

## Deliverables

- Tree-walking evaluator over the desugared AST, pure and total
- All seven combining algorithms as total functions, with exhaustive algebra tests
- Minimal justification tree with spans and citations
- Fail-closed resolution of Indeterminate at the boundary
- In-language test runner executing test blocks
- The thirteen static analyses, at least in conservative form
- **DESIGN FREEZE**: no language change after this phase without an RFC

## Exit criteria - all must hold

1. allow, deny, and require work end to end: lexed, parsed, checked, evaluated, explained, tested
2. Commutativity and associativity hold exhaustively for the six order-independent combiners
3. Every example in examples/ evaluates with the expected decision

## Traps specific to this phase

- Adding a fourth keyword before the slice is complete. This is the rule that matters most.
- Optimising the tree walker. It is throwaway; Phase 7 is where speed happens.
- Skipping the freeze because the design still feels improvable. Freeze it and record the RFCs instead.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P5

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

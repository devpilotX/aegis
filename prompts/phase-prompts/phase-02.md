# Phase 02 Prompt - Parser

**Duration:** 2 weeks | **Language:** TypeScript | **Specs:** 02-parser | **Invariants:** I1, I8, I10

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Turn tokens into a typed AST matching the grammar exactly, with deliberate recovery.

## Deliverables

- AST node set mirroring docs/03 one-to-one, span on every node
- Recursive descent for declarations, Pratt parser for expressions with the full binding-power table
- Explicit non-associativity diagnostics at the comparison, relational, and temporal levels
- Panic-mode recovery with chosen synchronisation tokens and cascade suppression
- Pretty printer, with parse-print-parse idempotence proven by property test
- Fuzz target run to zero panics

## Exit criteria - all must hold

1. Every grammar production is exercised by at least one fixture
2. a < b < c produces AEG-4120, not a misparse
3. Three independent syntax errors in one file all surface in one run

## Traps specific to this phase

- Reaching for a parser generator. Read docs/15 section 3 again.
- Implementing non-associativity as a loop, which turns a helpful error into a silent reinterpretation.
- Adding a keyword that is not in the frozen specification.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P2

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

# Phase 01 Prompt - Lexer

**Duration:** 1 week | **Language:** TypeScript | **Specs:** 01-lexer | **Invariants:** I1, I2, I11

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Turn source text into a token stream with exact spans and every lexical limit enforced.

## Deliverables

- Token kind enumeration and Token struct with half-open byte spans
- NFC normalisation and UTF-8 validation at the boundary
- Scanner with maximal munch, keyword table, all literal forms, both comment forms
- Every AEG-1xxx diagnostic implemented with a golden fixture
- Round-trip property test and a fuzz target run to zero panics

## Exit criteria - all must hold

1. Every file in examples/ tokenises with byte-exact expected spans
2. Every AEG-1xxx code has a golden fixture
3. Fuzzing finds no panic and no hang over one hour

## Traps specific to this phase

- Reaching for a regex engine. Write the scanner by hand.
- Storing line and column on every token. Store byte offsets; derive positions from a line index.
- Silently replacing invalid UTF-8. That is AEG-1001, not a repair job.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P1

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

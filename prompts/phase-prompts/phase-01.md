# Phase 01 Prompt - Lexer

**Duration:** 1 week | **Language:** TypeScript | **Specs:** 01-lexer | **Invariants:** I1, I2, I11

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Turn source text into a token stream with exact spans and every lexical limit enforced.

## Deliverables

- Token kind enumeration and Token type with half-open, 0-based, raw-byte spans
- UTF-8 validation at the boundary as a fatal check; **no normalisation of any kind**
- Scanner with maximal munch, the 77-word keyword table, the 29 reserved-forbidden words, all literal forms, and trivia retention for both comment forms
- Every surviving AEG-1xxx diagnostic implemented with a golden fixture
- Byte-exact round-trip property test over tokens plus trivia, and a fuzz target run to zero panics

## Exit criteria - all must hold

1. Every file in `conformance/valid/lexer/` tokenises with byte-exact expected spans and trivia
2. Every file in `conformance/invalid/lexer/` produces exactly the expected diagnostic code and no other
3. Every surviving AEG-1xxx code has a golden rendered fixture
4. Fuzzing finds no panic and no hang: 60 seconds pre-commit, 24 hours nightly

The former criterion "every file in examples/ tokenises" is withdrawn. Those files were found in the P0 audit to be invalid AEGIS and are quarantined in `examples/draft/`.

## Traps specific to this phase

- Reaching for a regex engine. Write the scanner by hand. The RE2 patterns in `docs/03` section 0 are specification prose, not an implementation strategy.
- Storing line and column on every token. Store byte offsets; derive positions from a line index.
- Silently replacing invalid UTF-8. That is AEG-1001, it is fatal, and it is not a repair job.
- Normalising anything. Source is never normalised; spans address the bytes as authored.
- Validating a currency code. `EUR` and `Set` are the same lexical class; validity is `AEG-4140` in the checker.
- Discarding comments. They are trivia and the byte-exact round-trip depends on them.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P1

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

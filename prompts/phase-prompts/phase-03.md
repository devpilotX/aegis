# Phase 03 Prompt - Diagnostics Engine

**Duration:** 1 week | **Language:** TypeScript | **Specs:** 02-parser | **Invariants:** I8, I10

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Make diagnostics the product. Every message structured, spanned, explained, and fixable.

## Deliverables

- Structured diagnostic type with primary and secondary spans, severity, why, and help
- Snippet renderer with caret underlining, correct for tabs, wide characters, and multi-byte UTF-8
- Bounded-distance did-you-mean with deterministic ranking
- Deduplication, cascade suppression, deterministic ordering, and output capping
- JSON, LSP, and SARIF emitters
- Golden fixtures for the exact rendered text of every catalogue entry

## Exit criteria - all must hold

1. Every entry in docs/10 renders and is golden-tested
2. A non-programmer can read ten sample diagnostics and say what to change
3. Output is byte-identical across two runs on the same input

## Traps specific to this phase

- Treating this phase as optional polish. Diagnostics are the primary product surface.
- Writing messages in compiler jargon.
- Warning about something the author cannot act on.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P3

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

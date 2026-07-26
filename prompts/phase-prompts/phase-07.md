# Phase 07 Prompt - IR, Bytecode, and VM

**Duration:** 3 weeks | **Language:** Go | **Specs:** 06-ir-compiler, 07-runtime-pdp | **Invariants:** I1, I2, I5, I11

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Replace the tree walker with a canonical IR, a bytecode format, and a register VM inside budget.

## Deliverables

- Canonical IR with byte-stable serialisation and an IR digest
- Register-based instruction set with no backward jump
- Deduplicated, canonically ordered constant pool with exact value encodings
- .aegisc writer and a fully validating loader, fuzzed to zero panics
- VM dispatch loop with pooled contexts and no hot-path allocation
- Disassembler with golden output
- Optional optimisations behind a flag, plus a no-optimisation mode

## Exit criteria - all must hold

1. p50 under 100 microseconds and p99 under 1 millisecond on the 1,000-rule corpus
2. Optimised and unoptimised builds produce identical decisions and identical justifications
3. Semantically equivalent sources produce byte-identical IR

## Traps specific to this phase

- Using a timeout as the totality mechanism. Totality is static; the budget is only defence in depth.
- Letting an optimisation remove a justification instruction.
- Optimising before profiling.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P7

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

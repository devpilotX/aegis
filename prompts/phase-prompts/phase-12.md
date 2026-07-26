# Phase 12 Prompt - WASM, C ABI, and SDKs

**Duration:** 2 weeks | **Language:** Go | **Specs:** 11-wasm-embed | **Invariants:** I2, I3, I9

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Achieve host-language independence with one core and two exposure surfaces.

## Deliverables

- Stable, documented C ABI with integer status codes
- c-shared and wasip1 builds from the identical evaluator
- WASM module under 6 MB importing no clock and no filesystem
- Thin SDKs for Python, Node.js, browser, and Java
- HTTP and gRPC sidecars with health endpoints and graceful shutdown
- wasip1 added to the determinism harness targets

## Exit criteria - all must hold

1. Native and WASM produce identical decisions, justifications, and evidence bodies
2. The conformance suite passes through three host languages with identical results
3. Every SDK fails closed on any error

## Traps specific to this phase

- Putting logic in an SDK, which creates a second place semantics can live.
- Importing a WASI clock, which would breach purity.
- Treating a WASM/native divergence as an acceptable platform difference.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P12

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

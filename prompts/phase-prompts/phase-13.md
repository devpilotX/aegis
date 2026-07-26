# Phase 13 Prompt - Conformance and Specification v1.0

**Duration:** 3 weeks | **Language:** Go and TLA+ | **Specs:** 12-conformance | **Invariants:** I10, I2

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Make the specification independent, and prove the core semantics as far as is honest.

## Deliverables

- 1,200+ conformance cases across valid, invalid, and canonical
- Standalone runner executable by a third party
- Coverage tracker gating CI on unmapped productions and unmapped diagnostic codes
- TLA+ model establishing totality, determinism, combiner algebra, fail-closed, and justification completeness
- Explicit written list of every unproven assumption
- Specification v1.0 frozen and the numbered RFC process published

## Exit criteria - all must hold

1. A stranger can implement AEGIS from docs/02, docs/03, and the suite
2. TLC model-checks every listed property over bounded configurations
3. No public claim of formal guarantee exceeds what the model actually establishes

## Traps specific to this phase

- Overclaiming formal verification. Say exactly what is and is not proven.
- Letting the suite lag the implementation, which inverts I10.
- Freezing v1.0 before a real deployment exists. Ship into AgentProof/Veydria first.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P13

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

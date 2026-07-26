# Phase 08 Prompt - Evidence Engine

**Duration:** 2 weeks | **Language:** Go | **Specs:** 08-audit-evidence | **Invariants:** I6, I8

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Make signed, hash-chained evidence an output of evaluation, and verify it independently.

## Deliverables

- Evidence record schema and canonical serialisation with fixed ordering
- SHA-256 chain with genesis handling, Ed25519 signing with key identifiers and validity windows
- Decisive-binding-only recording, redaction before hashing with recorded reasons
- An independent verifier sharing no serialisation code with the writer
- Replay from evidence confirming decision identity, failing closed on version mismatch

## Exit criteria - all must hold

1. Insertion, deletion, and single-byte mutation are each detected
2. A redacted record still verifies
3. Historical records verify against the key valid at their timestamp after rotation

## Traps specific to this phase

- Writing custom cryptography or a bespoke canonical form without review.
- Sharing the serialiser between writer and verifier, which reduces verification to self-consistency.
- Writing tamper-proof anywhere. The accurate word is tamper-evident.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P8

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

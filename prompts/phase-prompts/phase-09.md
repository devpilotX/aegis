# Phase 09 Prompt - CLI and Static Binary

**Duration:** 2 weeks | **Language:** Go | **Specs:** 09-cli-tooling | **Invariants:** I9, I2, I7

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Ship one static binary that does everything, and prove it depends on nothing.

## Deliverables

- check, build, test, eval, explain, report, verify-evidence, bundle, fmt, conformance run
- --json output for every command and disciplined exit codes
- Cross-compilation for five targets with CGO_ENABLED=0
- Scratch-container independence test in CI
- Reproducible-build verification across two runners
- Signed bundles with pinned clause versions and embedded test results

## Exit criteria - all must hold

1. The binary runs in a scratch container with no other files present
2. Two independent machines produce byte-identical binaries
3. A release build refuses to bundle when a policy test fails

## Traps specific to this phase

- Putting logic in cmd/. Argument parsing only.
- Allowing an unsigned bundle to load as a convenience.
- Letting the fail-closed default become configurable without an audited setting.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P9

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

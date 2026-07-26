# Phase 10 Prompt - Audit Report Generator

**Duration:** 2 weeks | **Language:** Go | **Specs:** 08-audit-evidence | **Invariants:** I5, I8

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Generate the document that makes a compliance officer say yes, from the same IR as the bytecode.

## Deliverables

- Report generator consuming the IR directly
- Plain-language rendering of every rule with its doc comment, reason, and citations
- Prominent highlighting of fail-open configuration and every suppression
- Markdown, HTML, and PDF output, byte-stable given a fixed timestamp
- Semantic policy diffing between two bundle versions

## Exit criteria - all must hold

1. A compliance-literate reader accepts a generated report unmodified
2. No code appears anywhere in the output
3. Two runs with a fixed timestamp produce identical bytes

## Traps specific to this phase

- Generating the report from the AST instead of the IR, which permits drift and breaks I5.
- Burying a fail-open default in a footnote.
- Including code snippets because they feel precise. The audience does not read code.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P10

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

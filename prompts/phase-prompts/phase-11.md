# Phase 11 Prompt - LSP and Formatter

**Duration:** 3 weeks | **Language:** Go | **Specs:** 10-lsp | **Invariants:** I8, I2

Paste this after `prompts/MASTER-PROMPT.md`. It scopes the agent to this phase and nothing beyond it.

---

## Goal

Make the authoring experience good enough for a non-programmer to write policy confidently.

## Deliverables

- LSP server over stdio reusing the CLI's lexer, parser, checker, and analyser
- Incremental reparse, analysis caching by IR digest
- Hover, go-to-definition, find-references, document and workspace symbols, semantic tokens
- Schema-aware attribute completion and clause citation completion with versions
- Code actions for unambiguous fixes
- Canonical, idempotent formatter
- Minimal VS Code extension

## Exit criteria - all must hold

1. Diagnostics publish within 200 milliseconds on a 1,000-rule workspace
2. Formatting is idempotent and preserves the AST exactly
3. Navigation still works from the last good parse when the document is invalid

## Traps specific to this phase

- Writing a second parser for the editor. One implementation, always.
- Non-deterministic completion ordering.
- Crashing the editor session on an internal error instead of logging and continuing.

## Standing constraints

- Work strictly through the task list in the named spec, top to bottom, one task per turn.
- Do not implement anything absent from `requirements.md`. If it seems necessary, amend the specification first (I10).
- No new keyword, no new construct, and no scope expansion in this phase.
- Every behaviour change ships with tests and a specification update in the same commit.
- Refuse anything that would breach an invariant, opening with `**Invariant violation - refusing.**`

## Turn format

Open with `SPEC: <spec-id> | TASK: <n.n> | PHASE: P11

`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`.

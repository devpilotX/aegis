# Design - Language Server and Formatter

**Spec ID:** `10-lsp` | **Phase:** P11 | **Invariants:** I8, I2

## Approach

A single binary mode (`aegis lsp`) speaking LSP over stdio, reusing the same lexer, parser, checker, and analyser as the CLI. No second implementation of anything - that would violate I10 in spirit and guarantee drift.

Incremental reparse at the declaration level keeps latency inside budget. Analysis results are cached by IR digest. Findings are converted from the shared diagnostic type into LSP diagnostics, so wording is identical between editor and CI.

## Invariant obligations

Every task in `tasks.md` must leave these true:

I8, I2

## Dependency rules

Dependencies flow downward only. This component must not import any component later in the pipeline. Files stay under 600 lines; functions under 60. `cmd/` contains argument parsing only.

## Testing plan

| Layer | Applies here |
|---|---|
| Unit | Every exported function, every error path |
| Golden | Every rendered output and every diagnostic |
| Property | Every invariant this component can violate |
| Fuzz | Every function that accepts untrusted input |
| Differential | From Phase 6, against the other implementation |
| Conformance | Every acceptance criterion above maps to at least one case |

## Definition of done for this spec

Every acceptance criterion in `requirements.md` has a passing test. Every diagnostic has a catalogue entry and a golden fixture. Coverage meets the floor for this package group. The differential and determinism harnesses pass. The specification documents are updated in the same commit as the behaviour change.

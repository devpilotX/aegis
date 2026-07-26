# Design - Lexer

**Spec ID:** `01-lexer` | **Phase:** P1 | **Invariants:** I1, I2, I11

## Approach

Hand-written scanner over a byte slice with one byte of lookahead. NFC normalisation happens before the scanner sees the input. A perfect-hash or map keyword table resolves identifiers. No regular-expression engine and no generator anywhere in this component. Spans are half-open byte offsets; line and column are computed lazily by a line-index built during scanning, so the hot path stays branch-light.

Token kinds are a closed enumeration in `internal/token`. `internal/lexer` imports `token` and `diag` only - never `ast` or `parser`. Errors are accumulated in a diagnostic sink rather than returned, which is what allows single-pass multi-error reporting.

## Invariant obligations

Every task in `tasks.md` must leave these true:

I1, I2, I11

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

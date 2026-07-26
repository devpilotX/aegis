# Design - Parser

**Spec ID:** `02-parser` | **Phase:** P2 | **Invariants:** I1, I8, I10

## Approach

Recursive descent, one function per non-terminal, plus a Pratt parser for expressions with an explicit binding-power table. Written by hand for the four reasons in docs/15 section 3. Helpers: `peek`, `check`, `match`, `expect`, `synchronise`.

Non-associativity is implemented by parsing a single operand pair at the comparison, relational, and temporal levels and then explicitly diagnosing a further operator at the same level, rather than by looping. That is what turns `a < b < c` into a helpful error instead of a misparse.

The AST is a closed set of structs in `internal/ast`. `internal/parser` imports `token`, `ast`, and `diag` only.

## Invariant obligations

Every task in `tasks.md` must leave these true:

I1, I8, I10

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

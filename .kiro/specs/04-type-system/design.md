# Design - Type System

**Spec ID:** `04-type-system` | **Phase:** P4 | **Invariants:** I2, I4, I10

## Approach

Two mutually recursive entry points, `infer` and `check`, over the desugared AST. Literals, paths, and builtin calls synthesise. Rule conditions, obligation `when` clauses, and quantifier bodies are checked against Bool. This is what makes every type error able to state where the expectation came from.

The type representation is a closed sum in `internal/types`: base types, `Money[CUR]` with the currency as part of the type identity, `Optional[T]`, `Set[T]`, `Record{...}`, and `Enum<E>` as nominal. Subtyping is a single relation with exactly one non-reflexive pair, `Percent <: Decimal`.

No unification variables and no global constraint solving, deliberately: local inference is what keeps error messages explainable (I8) and checking cost bounded (I11).

## Invariant obligations

Every task in `tasks.md` must leave these true:

I2, I4, I10

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

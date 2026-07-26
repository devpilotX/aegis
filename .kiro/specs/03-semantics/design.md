# Design - Desugaring and Binding

**Spec ID:** `03-semantics` | **Phase:** P4 | **Invariants:** I1, I8, I10

## Approach

Two passes. Pass one walks all declarations and populates a scope tree, so declaration order is irrelevant. Pass two resolves every reference and records a link from use site to declaration, which the LSP later consumes for go-to-definition.

Desugaring runs before binding and is span-preserving. Keeping desugaring separate means the type checker, the analyser, and the compiler all see exactly one rule shape - the single largest simplification in the entire pipeline.

Did-you-mean uses bounded Levenshtein distance over in-scope names with deterministic tie-breaking by name order.

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

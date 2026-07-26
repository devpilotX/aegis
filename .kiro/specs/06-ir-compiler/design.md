# Design - IR and Compiler

**Spec ID:** `06-ir-compiler` | **Phase:** P7 | **Invariants:** I2, I5, I11

## Approach

Three stages: lower the checked AST to a linear IR, canonicalise the IR, then emit. Register allocation is linear scan over a virtual register file. The constant pool is deduplicated and canonically ordered by encoded bytes, which is what makes byte-stable output possible.

Decimals are encoded as sign plus scaled integer, money as minor units plus exponent plus currency tag, durations as integer milliseconds, sets in canonical element order. No floating point exists anywhere in the encoding.

`internal/ir` defines the representation, `internal/compile` performs lowering and emission, and `internal/report` consumes the same IR to produce the audit document. The dependency direction guarantees I5 structurally rather than by discipline.

## Invariant obligations

Every task in `tasks.md` must leave these true:

I2, I5, I11

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

# Design - Runtime and PDP

**Spec ID:** `07-runtime-pdp` | **Phase:** P7 | **Invariants:** I2, I3, I4, I7, I8, I11

## Approach

A register VM with a jump-table dispatch loop over fixed-width instructions. Values are a compact tagged union; money carries a currency tag checked at every relevant opcode. Contexts are pooled and reused, so the hot path performs no heap allocation.

There is no `CALL`, no `RET`, and no backward jump in the instruction set. Totality is therefore visible in the instruction encoding itself, not merely asserted. A hard instruction budget exists as defence in depth only; it is explicitly not the totality mechanism.

Schema validation happens before the dispatch loop starts, which is what allows the loop itself to be panic-free by construction.

## Invariant obligations

Every task in `tasks.md` must leave these true:

I2, I3, I4, I7, I8, I11

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

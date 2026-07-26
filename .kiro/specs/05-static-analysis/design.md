# Design - Static Analysis

**Spec ID:** `05-static-analysis` | **Phase:** P5 | **Invariants:** I1, I2, I7, I11

## Approach

Rule conditions are encoded into an SMT formula over a decidable fragment - linear arithmetic over integers and rationals, plus equality, plus finite enumerations, plus bounded set membership. Z3 or CVC5 answers reachability, subsumption, contradiction, and coverage questions. Every solver call has a timeout, and a timeout produces a conservative result with an explicit note, never a silent pass.

Soundness over completeness: the analyser may fail to prove a real problem, but it MUST never declare something safe that is not. That asymmetry is stated in every finding's wording.

The cost model assigns a static cost to each IR instruction, with quantifiers multiplying by their cardinality bound. Because nesting is capped at depth 3 and cardinality at 4,096, the bound is always finite and computable.

## Invariant obligations

Every task in `tasks.md` must leave these true:

I1, I2, I7, I11

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

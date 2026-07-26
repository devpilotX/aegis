# Design - Conformance and Specification v1.0

**Spec ID:** `12-conformance` | **Phase:** P13 | **Invariants:** I10, I2

## Approach

The conformance suite is the real specification; prose is the explanation. Cases are generated from specification examples where possible so that the two cannot drift, and hand-written where behaviour is subtle.

The TLA+ model covers the evaluation algorithm and the combining algebra, model-checked with TLC over bounded configurations. It does not cover the lexer, the parser, or the cryptography, and the documentation says so plainly rather than implying a whole-system proof.

## Invariant obligations

Every task in `tasks.md` must leave these true:

I10, I2

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

# Design - Audit and Evidence

**Spec ID:** `08-audit-evidence` | **Phase:** P8 | **Invariants:** I5, I6, I8

## Approach

`internal/evidence` owns canonical serialisation, hashing, and signing. The verifier lives in a separate package with its own independent canonical serialiser, tested against fixtures produced by the writer. Sharing the serialiser would reduce verification to self-consistency, which proves nothing.

Canonical form: fixed field order, sorted keys, no insignificant whitespace, decimals as sign plus scaled integer, timestamps as RFC 3339 UTC at fixed precision. Redaction happens before hashing so redacted records still verify.

`internal/report` consumes the IR directly. Report generation is byte-stable given a fixed generation timestamp, and the timestamp is the only non-content input.

## Invariant obligations

Every task in `tasks.md` must leave these true:

I5, I6, I8

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

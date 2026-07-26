# Design - WASM and Embedding

**Spec ID:** `11-wasm-embed` | **Phase:** P12 | **Invariants:** I2, I3, I9

## Approach

One Go core, two exposure surfaces: a `c-shared` build for the C ABI and a `wasip1` build for WASM. Both call the identical evaluator. The determinism harness treats `wasip1` as a first-class target precisely because a WASM/native divergence would be an invariant breach, not a platform quirk.

SDKs are thin. Any logic in an SDK is logic that can diverge, so SDKs marshal JSON, call, and unmarshal - nothing else.

## Invariant obligations

Every task in `tasks.md` must leave these true:

I2, I3, I9

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

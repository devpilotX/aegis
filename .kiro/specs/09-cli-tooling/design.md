# Design - CLI and Tooling

**Spec ID:** `09-cli-tooling` | **Phase:** P9 | **Invariants:** I9, I2, I7

## Approach

`cmd/aegis` contains argument parsing and nothing else; every command delegates immediately into `internal`. Cross-compilation targets linux/amd64, linux/arm64, darwin/arm64, windows/amd64, and wasip1, all with `CGO_ENABLED=0` and `-ldflags="-s -w"`.

The scratch-container test is the operational proof of I9 and runs in CI on every release. The reproducible-build check runs on two independent runners and diffs binary hashes.

## Invariant obligations

Every task in `tasks.md` must leave these true:

I9, I2, I7

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

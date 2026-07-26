---
inclusion: always
---

# Testing and Quality Gates

A governance language that is merely mostly correct is worthless, because its output is used to answer regulators. The bar is deliberately higher than normal application code.

## Seven layers

| Layer | What it proves |
|---|---|
| 1. Unit | Each function behaves per spec, table-driven |
| 2. Golden | Diagnostics and reports render byte-exactly |
| 3. Property | Invariants hold across generated inputs |
| 4. Differential | Go and TypeScript implementations agree on the whole corpus |
| 5. Fuzz | No panic, no hang, no non-termination on arbitrary bytes |
| 6. Conformance | The published suite passes, 1,200+ cases |
| 7. Determinism | Byte-identical output across 6 targets x 10,000 runs |

## Layer 0 - corpus consistency, already enforced

`node scripts/check-corpus.mjs`, gated by `.github/workflows/corpus.yml` on every push and pull request. Seven checks: keyword arithmetic and steering drift, grammar terminal classification, forward and reverse catalogue closure, retired codes anywhere, retired constructs in AEGIS code, and commit task-id trailers. It runs before any compiler exists because the defect it catches - a document contradicting the specification - is the one that has actually occurred.

## Coverage floors - CI-enforced

| Package group | Line | Branch |
|---|---|---|
| `internal/vm`, `internal/combine` | 100% | 100% |
| `lexer` `parser` `types` `check` `ir` `compile` `evidence` | 95% | 90% |
| `diag` `report` `analysis` | 90% | 85% |
| `cmd` `lsp` | 80% | 70% |
| Repository-wide | 90% | 85% |

Mutation score on the checker and evaluator: at least 75%.

## Eight mandatory properties

1. **Termination.** Every generated program terminates within its computed bound.
2. **Determinism.** Same bundle plus same request yields identical bytes, always.
3. **Totality of combining.** All seven algorithms return a value for every input multiset.
4. **Monoid laws.** Six of the seven are associative and commutative with the stated identity. Verified exhaustively for multisets up to size 4, property-tested beyond.
5. **Fail-closed.** No input sequence turns `Indeterminate` into `Permit`.
6. **Round-trip.** Reprinting tokens plus trivia reproduces the source byte for byte, and parse, print, parse is idempotent for every valid program.
7. **Evidence integrity.** Any single-byte mutation, insertion, deletion, or reordering in the chain is detected.
8. **Justification completeness.** Every non-`NotApplicable` decision names at least one decisive rule with a reason.

## Determinism harness

Six targets: `linux/amd64`, `linux/arm64`, `darwin/arm64`, `windows/amd64`, `wasip1`, plus one second independent physical machine. 10,000 iterations each. Output hashes must match exactly. Any mismatch is a Severity 1 defect that stops all other work.

## Fuzzing

60 seconds in the pre-commit path. 24 hours nightly in CI. Targets: lexer, parser, bundle loader, request decoder, evidence verifier. Zero panics and zero non-termination. Every crash becomes a permanent regression case in `conformance/invalid/`.

## Performance budgets - normative, CI-gated

| Metric | Target | Hard ceiling |
|---|---|---|
| Cold start | 15 ms | 50 ms |
| Bundle load, 1,000 rules | 20 ms | 100 ms |
| Decision p50 | 100 us | - |
| Decision p99 | 1 ms | 5 ms |
| Throughput per core | 50,000 decisions/s | - |
| Resident memory | 25 MB | 64 MB |
| Binary size | 12 MB | 25 MB |
| WASM size | 6 MB | 12 MB |
| Evidence generation | 50 us | 200 us |
| Compile 1,000 rules | 500 ms | 2 s |

A pull request that regresses a target by more than 10% must either be fixed or carry a written justification.

## Definition of done for any task

- [ ] Behaviour matches the specification section it cites
- [ ] Unit tests cover happy path, every error path, and every boundary
- [ ] New diagnostics have golden tests and conformance cases
- [ ] Properties still hold
- [ ] `make test lint` is clean
- [ ] Coverage floor met for the touched package
- [ ] No new dependency, or a justification for one
- [ ] Spec, error catalogue, and glossary updated if behaviour changed
- [ ] Exactly one commit, correctly formatted

## What a test must never do

- Assert on wall-clock time
- Depend on map iteration order
- Read from the network or the environment
- Use `time.Now()` instead of an injected clock
- Be skipped with a TODO

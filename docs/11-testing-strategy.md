# 11 - Testing Strategy

Seven layers. Each catches a class the others cannot.

| Layer | Catches | Where |
|---|---|---|
| Unit | Logic errors in a single function | Every package |
| Golden | Unintended output changes | Lexer, parser, diagnostics, IR, disassembler, audit report |
| Property | Violated invariants over random inputs | Round-trips, combiner algebra, determinism |
| Fuzz | Crashes and hangs on hostile input | Lexer, parser, IR decoder, bytecode loader |
| Differential | Semantic divergence between v0 and v1 | Phase 6 onward, every commit |
| Conformance | Specification violations | Public suite, third-party runnable |
| Determinism | Platform and run-to-run variance | 10,000 iterations x 6 targets |

## Coverage floors

| Package group | Line | Branch |
|---|---|---|
| `internal/vm`, `internal/combine` | 100% | 100% |
| `internal/lexer`, `parser`, `types`, `check` | 95% | 90% |
| `internal/ir`, `compile`, `evidence` | 95% | 90% |
| `internal/diag`, `report`, `analysis` | 90% | 85% |
| `cmd/`, `internal/lsp` | 80% | 70% |
| **Whole repository** | **90%** | **85%** |

Coverage is a floor, not a goal. A 100%-covered evaluator with no property tests is still untrustworthy.

## Properties that MUST hold

1. Reprinting the token stream **together with its trivia** reproduces the source **byte for byte**. Comments and whitespace are trivia, not discarded text, so the weaker "modulo whitespace" form of this property is superseded: it was unachievable while comments were being dropped, and it is now both stronger and true.
2. Parse, print, parse again yields an identical AST.
3. Semantic-preserving source edits yield an identical canonical IR.
4. The same bundle and request yield an identical decision, justification, and evidence body, every time, on every platform.
5. The six order-independent combiners are commutative and associative.
6. A well-typed program never produces a runtime type error.
7. Optimised and unoptimised builds produce identical decisions and identical justifications.
8. Every generated evidence chain verifies; any single-byte mutation fails verification.

## Fuzzing

Four targets, continuous in CI. **60 seconds in the pre-commit path, 24 hours nightly and before any release.** Criteria: zero panics, zero non-termination, zero out-of-bounds. Seed corpus grows from every conformance case and every historical crash. Any crash is a release blocker.

## Differential testing

From Phase 6, every commit runs the entire conformance corpus through both the TypeScript v0 and the Go v1 implementation and diffs decision, justification, and diagnostic codes. A mismatch is triaged to root cause before any other work continues. This is the single highest-value test in the project because it catches translation errors that no unit test would.

## Conformance suite layout

```
conformance/
  valid/     <case>.aegis  <case>.request.json  <case>.expected.json
  invalid/   <case>.aegis  <case>.expected-diagnostics.json
  canonical/ <case>.aegis  <case>.ir.json  <case>.aegisc
```

Organised by feature and by diagnostic code, with a coverage tracker mapping every grammar production and every catalogue entry to at least one case. 1,200 cases minimum at v1.0. The runner is a standalone binary any third party can execute.

## Mutation testing

Run on `internal/check` and `internal/vm`. Target 75%+. Surviving mutants are killed with targeted tests or explicitly documented as semantically equivalent. Do not chase 100%; chase understanding of what survived and why.

## Determinism harness

`make determinism` compiles a fixed corpus 10,000 times and evaluates a fixed request set, diffing bytes across linux/amd64, linux/arm64, darwin/arm64, windows/amd64, wasip1, and a second independent machine. Any failure is Sev-1 and stops all other work.

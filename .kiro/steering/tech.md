---
inclusion: always
---

# Technology and Toolchain

## Two implementations, on purpose

| Version | Language | Purpose | Lifespan |
|---|---|---|---|
| v0 | TypeScript (Node 22.13+) | Design exploration. Fast to iterate while the language shape is still moving. | Phases 1-5, then discarded |
| v1 | **Go 1.22+** | The real implementation. Single static binary. | Phase 6 onward, forever |

The v0 implementation is a throwaway prototype and must be treated as one. Do not add features to it after Phase 5. Do not port its architecture verbatim - port its behaviour, verified by differential testing against the entire corpus.

Rationale: learning Go while simultaneously designing a novel type system is the second-fastest way to fail. Separate the two problems.

## The v0 layout - normative, so it is never ambiguous again

Phases 1-5 live in `v0/`. TypeScript strict mode, pnpm, vitest as the only dependency.

```
v0/
  package.json          pnpm, TypeScript 5+, vitest pinned exactly
  tsconfig.json         strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes
  vitest.config.ts      coverage thresholds per the table in testing.md
  src/
    token/              token kinds, spans, Token, keyword table
    lexer/              source bytes -> tokens + trivia
    diag/               diagnostic type, sink, renderer
    ast/ parser/ desugar/ types/ check/ eval/
  conformance-runner/   reads ../conformance
```

The same file and function limits apply as in v1: 600 lines per file, 60 per function, 5 parameters, cyclomatic complexity 15, nesting depth 4. Dependencies flow downward exactly as they will in Go, so Phase 6 is a translation rather than a redesign: `lexer` imports `token` and `diag` only.

There is no `spec/` directory in either tree. `docs/03-grammar.md` is the one normative home for the grammar.

## Why Go for v1

1. Single static binary with `CGO_ENABLED=0` satisfies I9 directly, with no runtime, no interpreter, and no shared libraries.
2. Cross-compiles to six targets from one machine with no toolchain gymnastics.
3. `GOOS=wasip1 GOARCH=wasm` gives a WASM build from the same source.
4. Deterministic by default if map iteration is avoided, which the linter enforces.
5. Boring, stable, fast enough. p99 under 1 ms is comfortably reachable.

Not Rust: the borrow checker tax is not worth paying for a tree-walking-to-register-VM workload, and the compile-time cost slows the iteration loop. Not C: I9 is achievable but memory safety would become a project of its own.

## Build commands

```
make build         # local binary into ./dist
make test          # unit + integration, coverage gates enforced
make lint          # golangci-lint + custom determinism vet checks
make fuzz          # 60s smoke; CI nightly runs 24h
make bench         # performance budget gate
make determinism   # 10,000 iterations x 6 targets, byte-identical
make conformance   # full conformance suite
make release       # all six cross-compiled targets, reproducible
```

## Cross-compilation targets (all six required)

```bash
CGO_ENABLED=0 GOOS=linux   GOARCH=amd64 go build -ldflags="-s -w" -o dist/aegis-linux-amd64 ./cmd/aegis
CGO_ENABLED=0 GOOS=linux   GOARCH=arm64 go build -ldflags="-s -w" -o dist/aegis-linux-arm64 ./cmd/aegis
CGO_ENABLED=0 GOOS=darwin  GOARCH=arm64 go build -ldflags="-s -w" -o dist/aegis-darwin-arm64 ./cmd/aegis
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o dist/aegis-windows-amd64.exe ./cmd/aegis
GOOS=wasip1 GOARCH=wasm go build -o dist/aegis.wasm ./cmd/aegis
```

## Independence proof

This must pass, or I9 is violated:

```dockerfile
FROM scratch
COPY dist/aegis-linux-amd64 /aegis
ENTRYPOINT ["/aegis"]
```

```bash
docker build -t aegis-scratch . && docker run --rm aegis-scratch version
```

## Dependency policy

- **Standard library only** for anything in the evaluation or evidence path. No exceptions.
- Cryptography: Go stdlib `crypto/*` only. Never hand-roll a primitive. Never import a third-party crypto library.
- Third-party dependencies are permitted only in `cmd/`, `internal/lsp`, and test tooling, and each one requires a written justification in the commit message.
- No dependency may be added that pulls in cgo.

## Forbidden constructs (linter-enforced)

- `map` iteration without an explicit sorted key slice
- `time.Now()` anywhere outside the PIP
- `float32` / `float64` anywhere in the evaluation path
- `math/rand` without an explicit injected seed, and never in evaluation
- `os.Getenv` in `internal/`
- goroutines in the evaluation path
- `panic` outside `main` and test helpers
- `strings.ToLower` / `ToUpper` without an explicit invariant-locale note

## Prerequisites to install

| Tool | Purpose |
|---|---|
| Go 1.22+ | v1 implementation |
| Node 22.13+ and pnpm 11 | v0 prototype, LSP client, SDK tests. pnpm 11 loads `node:sqlite`, so 22.13 is a hard floor, not a preference. |
| git | version control, one commit per task |
| make | build orchestration |
| golangci-lint | linting |
| Docker | scratch-container independence proof |
| Z3 or CVC5 | SMT backend for static analysis (Phase 5) |
| TLA+ / TLC | combining-algorithm proofs (Phase 13) |
| Python 3.11+ | SDK bindings and report tooling |

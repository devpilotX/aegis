# 15 - Implementation Guide

## 1. Toolchain

**Install now:**

| Tool | Version | Purpose |
|---|---|---|
| Git | any recent | Version control |
| Node.js | 20+ | v0 prototype runtime |
| TypeScript | 5+ | v0 prototype language |
| Go | 1.22+ | v1 production language |
| `make` | any | Task runner |
| VS Code or equivalent | any | Editor, and the LSP client for Phase 11 |

```bash
node --version && npx tsc --version && go version && git --version && make --version
```

**Never install, for this project:** LLVM, ANTLR, Bison, Flex, Yacc, any parser generator, Rust, Python, a database, a GPU driver, a cloud CLI. Everything fits under 1 GB and runs offline.

**Make targets:** `make build test lint fuzz bench determinism conformance release`

## 2. Repository layout

```
aegis/
  cmd/aegis/                  argument parsing only, no logic
  internal/
    token/ lexer/ ast/ parser/ desugar/
    types/ check/ analysis/
    ir/ compile/ vm/ combine/
    evidence/ report/ diag/ lsp/
  spec/  conformance/{valid,invalid,canonical}
  examples/  templates/  docs/
```

Dependencies flow downward only. `lexer` never imports `parser`. `vm` never imports `parser`. Files stay under 600 lines, functions under 60.

## 3. Why the parser is hand-written

Recursive descent with a Pratt expression parser, written by hand. No generator. Four reasons, in order of importance:

1. **Diagnostics are the product.** Generated parsers produce "syntax error near token X". AEGIS needs "you wrote `a < b < c`; comparison is non-associative here because policy text must never silently misparse; write `a < b and b < c`". Only a hand-written parser gives that control.
2. **Error recovery must be deliberate.** Panic-mode recovery with hand-chosen synchronisation tokens (`policy`, `rule`, `}`) lets multiple real errors surface in one run without cascades.
3. **No build-step dependency.** A generator is a dependency in the toolchain, a grammar file that drifts from the spec, and a generated artifact nobody reads. I9 in spirit.
4. **You learn the language you are designing.** Writing the parser by hand exposes every ambiguity in the grammar immediately, at the exact moment it can still be fixed cheaply.

The cost is roughly 1,200 lines of parser. That is a bargain.

## 4. Build order within a phase

For every component: define the data types first, write the golden test fixtures second, implement third, then diagnostics, then property tests, then fuzz, then documentation, then the spec update. Never implement before the fixtures exist - the fixtures are the specification of the component.

## 5. Phase 6 translation discipline

Do not rewrite. Translate. Go function by Go function, mirroring the TypeScript structure, running the differential harness after every file. Structural divergence between v0 and v1 makes mismatches untraceable. Once the harness is green across the whole corpus, and only then, refactor the Go code idiomatically - re-running the harness after every refactor.

## 6. Cross-compilation

```bash
CGO_ENABLED=0 GOOS=linux   GOARCH=amd64 go build -ldflags="-s -w" -o dist/aegis-linux-amd64 ./cmd/aegis
CGO_ENABLED=0 GOOS=linux   GOARCH=arm64 go build -ldflags="-s -w" -o dist/aegis-linux-arm64 ./cmd/aegis
CGO_ENABLED=0 GOOS=darwin  GOARCH=arm64 go build -ldflags="-s -w" -o dist/aegis-darwin-arm64 ./cmd/aegis
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o dist/aegis-windows-amd64.exe ./cmd/aegis
GOOS=wasip1 GOARCH=wasm go build -o dist/aegis.wasm ./cmd/aegis
```

Verify independence:

```bash
printf 'FROM scratch\nCOPY aegis /aegis\nENTRYPOINT ["/aegis"]\n' > Dockerfile
docker build -t aegis-scratch . && docker run --rm aegis-scratch version
```

If that runs, I9 holds.

## 7. Daily rhythm

30 minutes reading, 3 hours implementing, 30 minutes tests, 30 minutes spec and commit. Never end a day with a broken build. Never end a week without something demonstrable.

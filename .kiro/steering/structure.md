---
inclusion: always
---

# Repository Structure and Dependency Rules

## Layout

```
aegis/
  cmd/
    aegis/                  # CLI entry point - argument parsing ONLY
  internal/
    token/                  # token kinds, positions, spans
    lexer/                  # source bytes -> tokens
    ast/                    # abstract syntax tree node types
    parser/                 # tokens -> AST (recursive descent + Pratt)
    desugar/                # surface forms -> core Rule form
    types/                  # type lattice, infer, check
    check/                  # binding, resolution, semantic validation
    analysis/               # 13 normative static analyses, SMT interface
    ir/                     # AEGIS-IR/1 definition
    compile/                # AST -> IR -> bytecode
    vm/                     # register VM - the PDP
    combine/                # the 7 combining algorithms
    evidence/               # hash chain, signing, canonical encoding
    report/                 # IR -> compliance prose (I5 second output)
    diag/                   # diagnostics, rendering, error catalogue
    lsp/                    # language server
  conformance/
    valid/                  # must compile and evaluate as stated
    invalid/                # must fail with the exact diagnostic code
    canonical/              # byte-exact expected output fixtures
  examples/                 # working .aegis programs
  templates/                # regulation-mapped policy templates
  docs/                     # THE SPECIFICATION - source of truth (I10)
  prompts/                  # master prompt and phase prompts
  .kiro/                    # steering, specs, agents
```

Phases 1-5 additionally have a `v0/` TypeScript tree; its layout is in `tech.md`.

There is no `spec/` directory. `docs/03-grammar.md` is the normative grammar and `docs/02-language-specification.md` is the normative specification. One artifact, one home.

## Dependency rule - dependencies flow downward only

```
token <- lexer <- parser <- desugar <- check/types <- analysis <- ir <- compile <- vm
```

- `lexer` must never import `parser`.
- `parser` must never import `types`.
- `vm` must never import `parser` or `ast`. It sees only IR and bytecode.
- `diag` may be imported by anything; it imports nothing from the pipeline except `token`.
- `evidence` imports only `ir` and stdlib crypto. It must never import `vm`.
- Circular imports are a build failure, not a warning.

The `vm` isolation matters: it is what makes the runtime small, auditable, and embeddable, and it is what makes I9 achievable.

## The verifier must not share code with the writer

`aegis verify-evidence` must be implemented independently of `internal/evidence`'s writing path. A bug shared by writer and verifier is invisible. This is a hard architectural requirement, tested by mutation.

## File and function limits

| Limit | Value | Rationale |
|---|---|---|
| File length | 600 lines | Beyond this, split by responsibility |
| Function length | 60 lines | Beyond this, extract |
| Function parameters | 5 | Beyond this, pass a struct |
| Cyclomatic complexity | 15 | Beyond this, restructure |
| Nesting depth | 4 | Beyond this, invert or extract |

Exception: table-driven test files and generated code are exempt from the file-length limit. Nothing is exempt from the function-length limit.

## `cmd/` discipline

`cmd/aegis` contains argument parsing, output formatting, and exit codes. It contains no language logic. If a behaviour can be tested without a terminal, it belongs in `internal/`.

Exit codes are normative:

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Diagnostics were emitted |
| 2 | Internal error |
| 64 | Usage error |

## The XACML quartet mapping

| Role | Where it lives | Note |
|---|---|---|
| PEP - Policy Enforcement Point | Host application, via SDK / C ABI | Intercepts, and fails closed |
| PDP - Policy Decision Point | `internal/vm` | Pure, total, deterministic |
| PIP - Policy Information Point | Host, before evaluation | **The only component permitted I/O** |
| PAP - Policy Administration Point | `aegis` CLI, plus commercial registry | Authoring and distribution |

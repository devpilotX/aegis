# Design - Lexer

**Spec ID:** `01-lexer` | **Phase:** P1 | **Invariants:** I1, I2, I11

## Target: v0, TypeScript

Phase 1 is the **v0 TypeScript** implementation, per `MASTER-PROMPT.md` section 4.1. Earlier drafts of this document described the Go tree (`internal/token`, `internal/lexer`, `cmd/`), which belongs to v1 from Phase 6 onward. The v0 layout is:

```
v0/
  package.json           pnpm, TypeScript strict, vitest as the only dependency
  tsconfig.json          strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes
  vitest.config.ts       coverage thresholds at the lexer floor: 95% line, 90% branch
  src/
    token/               token kinds, spans, Token, keyword table
    lexer/               source bytes -> tokens + trivia
    diag/                diagnostic type, sink, renderer
  conformance-runner/    reads ../conformance, added in task 1.13
```

Dependency rule, unchanged in substance from v1: `lexer` imports `token` and `diag` only. It never imports `ast` or `parser`, and there is no component in v0 that may import `lexer` other than the parser in Phase 2.

The v1 Go implementation will mirror this as `internal/token` and `internal/lexer`. Phase 6 is a translation, verified by differential testing, not a redesign.

## Approach

Hand-written scanner over a byte array (`Uint8Array`) with one token of lookahead. No regular-expression engine and no generator anywhere in this component; the RE2 patterns in `docs/03` section 0 are specification prose, not an implementation strategy.

**No normalisation.** The scanner sees the file's raw bytes and nothing else. UTF-8 validity is checked at the boundary before scanning begins; invalid UTF-8 is `AEG-1001` and is fatal, because advancing past it would require guessing a character boundary and repair is forbidden by `docs/02` section 1.1.

**Spans are half-open 0-based raw byte offsets.** Line and column are derived on demand from a line index built during scanning: the index stores line-start offsets, and column derivation rescans that line counting Unicode scalar values. Nothing stores a position on a token, so no token can carry a stale one.

**Trivia is retained, not discarded.** Whitespace, line terminators, line comments, and doc comments produce no syntactic token; each is appended to the pending leading-trivia list of the next token. Doc comments carry a `doc` flag. This is what makes the byte-exact round-trip property achievable and what lets the parser - the only component that knows what a declaration is - perform doc attachment.

**Keyword resolution** is a frozen table: 77 keyword words, 29 reserved-forbidden words. Lookup is by exact byte equality on the lexeme. The table is a lookup structure only; it is never iterated, so no ordering question arises (I2).

**Diagnostics are accumulated in a sink**, not returned, which is what allows single-pass multi-error reporting. The sink enforces two rules from `docs/02` section 1.9: exactly one diagnostic per lexeme, chosen by the stated precedence order, and a hard cap of 200 diagnostics per file after which `AEG-1006` is emitted and lexing of that file stops. The build-wide cap of 2,000 (`AEG-0001`) belongs to the driver, not here. Three errors are fatal - `AEG-1001`, `AEG-1010`, `AEG-1006` - and every other error skips the offending lexeme and continues.

**One EOF token is emitted on every path**, including the empty file and every fatal path, so the parser needs no special case.

## What this component does not do

| Concern | Owner | Code |
|---|---|---|
| Currency validity | checker | AEG-4140 |
| Three-letter TypeIdent reservation | parser | AEG-3023 |
| Duration range on a `duration(n, unit)` call | checker | AEG-4141 |
| Quoted name length and character set | parser | AEG-3083, AEG-3080 |
| Quantifier nesting depth | parser | AEG-3081 |
| Import graph depth | loader | AEG-3082 |
| Collection cardinality | checker | AEG-4160 |
| Adjacent string concatenation, and the 64 KiB value limit | parser, then checker | AEG-4170 |
| Build-wide diagnostic cap | driver | AEG-0001 |
| Doc comment attachment | parser | AEG-2091 |
| Percent and money value construction | parser | - |

## Invariant obligations

Every task in `tasks.md` must leave these true.

**I1** - the scanner is a single forward pass with no backtracking; every loop advances the cursor by at least one byte, which is the termination argument and is asserted in the fuzz target.
**I2** - no map iteration, no locale-sensitive comparison, no float, no clock. Byte equality only.
**I11** - source size, line length, identifier length, digit count, and diagnostic count are all bounded, and the diagnostic cap bounds memory on hostile input.

## File and function limits

Same numbers as v1, expressed for TypeScript: files at most 600 lines, functions at most 60 lines, at most 5 parameters before passing an object, cyclomatic complexity at most 15, nesting depth at most 4. Table-driven test files are exempt from the file limit; nothing is exempt from the function limit.

## Testing plan

| Layer | Applies here |
|---|---|
| Unit | Every exported function, every error path, every boundary at limit and limit+1 |
| Golden | Every rendered diagnostic, and every token-plus-trivia stream in the lexer conformance corpus |
| Property | Byte-exact round-trip of tokens plus trivia; termination on arbitrary input |
| Fuzz | The scanner entry point, 60 s pre-commit and 24 h nightly, zero panics and zero hangs |
| Differential | From Phase 6, against the Go implementation |
| Conformance | Every acceptance criterion maps to at least one case in `conformance/*/lexer/` |

## Definition of done for this spec

Every acceptance criterion in `requirements.md` has a passing test. Every surviving `AEG-1xxx` code has a catalogue entry and a golden fixture. Coverage meets 95% line and 90% branch. The Phase 1 exit criterion in `requirements.md` holds. The specification documents are updated in the same commit as any behaviour change.

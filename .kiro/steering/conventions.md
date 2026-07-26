---
inclusion: always
---

# Code, Diagnostic, and Commit Conventions

## Go conventions

- Package names: short, lowercase, single word, no underscores. `lexer`, not `lexical_analysis`.
- Exported identifiers require a doc comment beginning with the identifier name.
- Errors: wrap with `fmt.Errorf("...: %w", err)`. Never discard an error with `_`. Never `panic` outside `main` and test helpers.
- Constructors return concrete types, not interfaces.
- Accept interfaces, return structs.
- Table-driven tests are the default. Name subtests as sentences describing behaviour.
- No `init()` functions anywhere in `internal/`.
- Sort before iterating any map. Always. The linter will catch you, but do not make it work.

## Naming inside the pipeline

| Concept | Name | Never |
|---|---|---|
| Source position | `Span{Start, End Pos}` | `Location`, `Range` |
| Token kind | `token.Kind` | `TokenType` |
| AST node | `ast.RuleDecl`, `ast.BinaryExpr` | `RuleNode`, `Binary` |
| Diagnostic | `diag.Diagnostic` | `Error`, `Problem` |
| Decision | `combine.Decision` | `Result`, `Verdict` |

## Diagnostics

Every diagnostic has a stable code `AEG-NNNN` that never changes meaning once released. Code ranges:

| Range | Class |
|---|---|
| 1000-1999 | Lexical |
| 2000-2999 | Warnings and advisories |
| 3000-3999 | Structural |
| 4000-4999 | Type and semantic |
| 5000-5999 | Runtime |
| 6000-6999 | Loader and bundle |

### Rendering standard (rustc-style, normative)

The frozen standard lives in `docs/10-error-catalog.md` and that file is the single authority; this is the same standard, restated for convenience.

```
error[AEG-4101]: currency mismatch in comparison
  --> policies/payments.aegis:42:18
   |
42 |   require resource.amount < money(500, USD)
   |           ^^^^^^^^^^^^^^^   --------------- Money[USD]
   |           |
   |           Money[EUR]
   |
   = note: currency is part of the Money type (type rule 2)
   = help: convert explicitly with convert(money(500, USD), to: EUR, rate: context.fx_eur_usd)
```

Required parts: severity, code, one-line summary, file:line:col, source excerpt with carets, at least one `note` explaining the rule, and at least one `help` proposing a fix. `= spec:` is optional. `= why:` does not exist. A secondary span is required only where a second location genuinely exists. A diagnostic without a `help` line is incomplete work.

Never say "invalid", "unexpected", or "malformed" alone. Say what was found, what was expected, and what to do.

## Every diagnostic needs a golden test

No diagnostic ships without a `conformance/invalid/` case asserting its exact code and a golden file asserting its exact rendered text. Coverage of the catalogue is a CI gate.

## Fabricated citations - hard stop

Never invent a regulation article number, clause identifier, or standard control ID. If unsure of a citation, write literally:

```
CITATION-NEEDED
```

CI greps for that token and fails the build. A wrong legal citation in a compliance tool is worse than a missing one, because someone will act on it.

## Commits

One task, one commit. Conventional Commits format, with the spec and task in the trailer.

```
feat(lexer): fuse duration literals into a single token

Implements integer-plus-unit duration lexing per docs/02 section 1.7, with
the three side conditions from docs/03 section 0.3: a letter or digit after
the unit is AEG-1055, a decimal magnitude is AEG-1056, and exponent
notation is AEG-1057. Range is checked in canonical milliseconds (AEG-1019).

Spec: 01-lexer
Task: 1.7
Invariants: I2, I11
```

<!-- retired-ok: AEG-1050 -->
Note what this example is not. There is no money literal to tokenize: `money(...)` is a call, and currency validity is `AEG-4140` in the checker, not `AEG-1050` in the lexer. Getting that wrong in a commit message is how a retired code returns to life.

Allowed types: `feat` `fix` `spec` `test` `perf` `refactor` `docs` `build` `chore`.

### Trailer forms - exactly two, and CI checks them

Every commit carries both a `Spec:` and a `Task:` trailer, in one of these two shapes and no other.

| Form | Trailers | Use for |
|---|---|---|
| Feature work | `Spec: <spec-id>` and `Task: <n.n>` | anything that implements or specifies a numbered task; the id MUST exist in that spec's `tasks.md` |
| Infrastructure | `Spec: none` and `Task: infra` | toolchain, CI, repository, and documentation work that no numbered task owns |

The `infra` form is legal **only** when the commit type is `build`, `chore`, `ci`, or `docs`. A `feat`, `fix`, `spec`, `test`, `perf`, or `refactor` commit carrying `Task: infra` is a failure: those types change behaviour or specification, and behaviour that no task owns is scope creep with a tidy label.

`ci` is accepted as a type here even though it is absent from the list above, because CI work is real and calling it `build` was the alternative.

The rule exists because the corpus checker asserts it against HEAD on every run. Commits made before the convention was introduced carry prose task descriptions and are deliberately not rewritten; only their numeric ids, where present, are still checked.

Use `spec:` when amending `docs/`. Specification amendments go in their own commit, before the code that depends on them (I10).

## Documentation duty

When behaviour changes, update in the same commit: the spec section, the error catalogue if a code was added, the conformance case, and the glossary if a term was introduced. A commit that changes behaviour without touching `docs/` should be justified in the message.

## Language and tone in user-facing text

- British-neutral English, plain words, no marketing voice.
- Say **tamper-evident**, never tamper-proof.
- Never write that AEGIS makes anyone compliant. It enforces, explains, and proves.

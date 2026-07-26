# 10 - Error Catalogue

Every diagnostic has a permanent code. Codes are never reused, never renumbered, and are part of the conformance surface: a conforming implementation MUST emit the same code for the same defect. Any diagnostic without a catalogue entry fails CI.

## Ranges

| Range | Category |
|---|---|
| `AEG-0000`-`0999` | Toolchain and driver |
| `AEG-1000`-`1999` | Lexical and lexical limits |
| `AEG-2000`-`2999` | Warnings and advisories |
| `AEG-3000`-`3999` | Structural, declaration, and syntax errors |
| `AEG-4000`-`4999` | Type and semantic errors |
| `AEG-5000`-`5999` | Runtime request errors |
| `AEG-6000`-`6999` | Bytecode and bundle loading |

The `0xxx` range exists because the driver is a real layer that the original catalogue had no home for: it owns whole-build concerns that no single file's lexer, parser, or checker can see.

**One defect, one code, one layer.** A diagnostic lives in the range of the layer that can actually detect it. Anything a one-token-lookahead scanner cannot see is not a `1xxx` code, and where that rule collided with the convenience of keeping an existing number, the rule won: nothing has shipped, so no code is load-bearing yet.

**Where one author mistake maps to two codes across two layers, both entries MUST carry an identical `= note:` line.** The codes differ because the detecting layer differs; the explanation the author reads must not. This applies today to the `AEG-1019` and `AEG-4141` pair, both of which say the same thing about the permitted duration range, and it applies to any future pair by the same rule.

## Toolchain and driver (AEG-0xxx)

| Code | Message | Notes |
|---|---|---|
| 0001 | build diagnostic limit reached, stopping | **fatal for the build**, at 2,000 diagnostics; the per-file cap is `AEG-1006` at 200 |

## Rendering standard - frozen

Exactly one standard, and this is it. Earlier drafts of this file, `conventions.md`, and `MASTER-PROMPT.md` section 5.2 each specified a different one; golden tests assert exact bytes, so three standards meant no standard.

```
error[AEG-4101]: currency mismatch in comparison
  --> payments.aegis:31:12
   |
31 |     deny resource.amount > money(10_000, USD)
   |          ^^^^^^^^^^^^^^^   ----------------- Money[USD]
   |          |
   |          Money[EUR], declared in schema.aegis:12:3
   |
   = note: currency is part of the Money type, so a comparison across
           currencies has no defined meaning (type rule 2)
   = help: convert explicitly, and record the rate for the auditor:
           deny resource.amount > convert(money(10_000, USD), to: EUR, rate: fx.eur_usd)
```

Required parts, in this order:

1. `severity[CODE]:` followed by a one-line summary
2. `  --> file:line:col`, 1-based line and column, column counted in Unicode scalar values
3. the source excerpt with carets under the primary span
4. at least one `= note:` naming the rule that was violated
5. at least one `= help:` proposing an actionable fix

`= spec:` is optional and may cite a specification section. `= why:` is deleted; its content belongs in `= note:`. A **secondary span** is required only where a second location genuinely exists - `AEG-4101` has one, `AEG-1001` does not.

**Severity is `error` or `warning`, and that is the whole set.** Fatality is a **separate boolean**, not a third severity: a fatal is an error that stops the pipeline, and conflating the two would make "how bad is it" and "can we continue" the same question when they are not. `AEG-1011` is a non-fatal error and `AEG-1010` is a fatal one; both are errors.

Earlier drafts listed four severities, `error`, `warning`, `advisory`, and `note`. That was a category error twice over. An *advisory* is a warning - the `2xxx` range is the advisory range, and `--strict` escalates the whole range to errors. A *note* was never a severity at all: `= note:` is a line **inside** a diagnostic, and listing it beside `error` invited a renderer to emit a bare note as though it were a finding.

**Strict mode escalates severity and MUST NOT touch fatality.** Under `--strict` a warning becomes an error; a non-fatal error does not become fatal, because whether the pipeline can continue is a property of the defect and not of the build configuration.

A diagnostic without a `help` line is incomplete work. Never say "invalid", "unexpected", or "malformed" alone: say what was found, what was expected, and what to do.

## Lexical (AEG-1xxx)

| Code | Message | Notes |
|---|---|---|
| 1001 | invalid UTF-8 byte sequence | **fatal**, stops lexing; no replacement characters, ever |
| 1002 | bidirectional override character not permitted in source | anywhere in the file |
| 1003 | confusable character in string literal or quoted name | never in an identifier; identifiers are ASCII-only |
| 1004 | non-ASCII identifier not permitted | |
| 1005 | unexpected character | also covers illegal underscore placement in a numeric literal |
| 1006 | too many lexical errors, stopping | **fatal for this file**, at 200 diagnostics; the build cap is `AEG-0001` |
| 1007 | carriage return not followed by a line feed | LF is the sole terminator; a CR is legal only as the first byte of CRLF |
| 1008 | byte order mark at start of file | **fatal**, pre-scan; rejected rather than stripped, because stripping shifts every offset |
| 1009 | NUL byte in source | **fatal**, pre-scan; valid UTF-8, never valid AEGIS, including inside a string |
| 1010 | source file exceeds 4 MiB | **fatal** |
| 1011 | line exceeds 4,096 bytes | measured in bytes; bounds a physical line, not a string value |
| 1012 | identifier exceeds 128 bytes | `ident` and `TypeIdent` alike |
| 1014 | numeric literal exceeds 38 significant digits | significance defined in `docs/02` section 1.2 |
| 1019 | duration outside the range 1 ms to 100 y | evaluated on the canonical millisecond value; shares its `= note:` with `AEG-4141` |
| 1030 | reserved keyword is forbidden in AEGIS | message MUST name the invariant or scope rule that forbids it |
| 1040 | unknown escape sequence | only `\"` `\\` `\n` `\t` exist |
| 1041 | unterminated string literal at end of line | strings are single-line; adjacent literals concatenate instead |
| 1042 | unterminated string literal at end of file | |
| 1055 | malformed duration literal | unknown unit, or a letter or digit immediately after the unit |
| 1056 | duration magnitude must be an integer | `1.5h` |
| 1057 | exponent notation is not supported | `1e10` |

### AEG-1005 characters with required help text

Every character in the reserved-semantics table of `docs/02` section 1.7 has a construct an author was reaching for. Naming it is the difference between a diagnostic and an obstacle.

| Found | Required help text |
|---|---|
| `!` alone | negation is `not`; `!` appears only in `!=` |
| `&` `\|` `^` | AEGIS has no bitwise operators; use `and`, `or`, `xor` for Bool |
| `&&` `\|\|` | write `and` and `or`; AEGIS has one spelling per operator |
| `~` | AEGIS has no bitwise negation; for pattern matching use `matches` with an RE2 pattern |
| `?` | AEGIS has no ternary operator; use `if C then A else B` |
| `?.` | AEGIS has no optional chaining; discharge the Optional with `x is some v`, then use `v` (fail-closed, I7) |
| `@` `#` `$` | reserved for a future annotation syntax and unavailable today |
| `;` | AEGIS has no statement terminator; delete it |
| `_` leading, trailing, doubled, or beside a decimal point | an underscore separates digits, e.g. `1_000.000_1` |

### AEG-1030 messages where absence is likely to confuse

A bare "reserved keyword" message is unhelpful when the author's intent has a legal spelling. These words get a tailored `= help:` line. Any future reservation whose absence could confuse gets the same treatment.

| Word | Required help text |
|---|---|
| `set` | ``set`` is reserved for a future named-set declaration; set literals are written with braces, e.g. `{ pii, financial }` |
| `between` | ``between`` is reserved; write two comparisons joined with `and`, e.g. `x >= lo and x <= hi` |
| `for` `at` `ago` | reserved for future temporal syntax; express freshness with `within`, e.g. `human.approved_at within 5m` |
| `always` `eventually` | reserved for future temporal logic; no equivalent exists in AEGIS 1.0 |
| `type` | reserved for a future type alias; write the type in the `schema` field directly |
| `where` | reserved; a rule's condition is written directly after `deny`, `allow`, or `require` |
| `target` | reserved; a policy's target is written with `applies_to` |
| `oblige` | reserved; write an `obligation` declaration |
| `fixture` | reserved for future test fixtures; use a `given` block in each `test` |
| `loop` `while` `recurse` | forbidden by I1 totality; AEGIS has no iteration other than bounded quantification |
| `mut` `ref` `ptr` | forbidden; AEGIS has no mutable state and no references |
| `macro` `template` `extends` `abstract` | forbidden; AEGIS has no user-defined abstraction |
| `async` `await` `yield` `spawn` | forbidden by I3 purity; evaluation is synchronous and performs no I/O |
| `import_dynamic` | forbidden; imports are static so that a bundle's contents are knowable before it runs |
| `unsafe` `native` | forbidden; there is no escape hatch from the evaluator |

### Lexical diagnostic precedence - normative

Exactly one diagnostic per lexeme. First match wins; the rest are suppressed. The first four are fatal and pre-scan, and produce no token stream at all - see `docs/02` section 1.9 for the pipeline order they follow.

```
1010  ->  1001  ->  1008  ->  1009      fatal, pre-scan, no token stream
  ->  1007  ->  1002  ->  1004  ->  1005
  ->  literal-form codes (1040 1041 1042 1055 1056 1057)
  ->  limit codes (1011 1012 1014 1019)
```

Without a stated order, two conforming implementations would report different codes for the same byte, and diagnostic codes are part of the conformance surface. `AEG-1007` precedes `AEG-1005` so that a stray CR is reported as the line-ending problem it is.

### AEG-1001 is the one diagnostic with no position

Every other diagnostic in this catalogue renders with `--> file:line:col` and a source excerpt. `AEG-1001` cannot: line and column are derived from the line index, the index may only be built over valid UTF-8, and the whole point of `AEG-1001` is that the bytes are not valid UTF-8.

It therefore renders with a **byte offset and a hex dump of up to eight bytes** beginning at the offending byte, and no excerpt:

```
error[AEG-1001]: invalid UTF-8 byte sequence
  --> payments.aegis, byte offset 1428
   |
   = note: bytes at this offset: ED A0 80 20 72 65 67 69
   = note: ED A0 80 encodes the surrogate U+D800, which UTF-8 forbids
   = help: re-save the file as UTF-8; a surrogate pair in the output usually
           means the source was written as CESU-8 or WTF-8
```

The P3 renderer MUST NOT assume every diagnostic has a line and column. This is stated here because that assumption is the natural one to make, and `AEG-1001` is the only counterexample in the catalogue.

`AEG-1008`'s help MUST be the literal instruction *save the file as UTF-8 without a byte order mark*. `AEG-1009`'s help MUST be *this file may be binary, or saved as UTF-16 - AEGIS source must be UTF-8*. Both are the fix rather than a description of the problem, and both will be hit by real contributors on their first day.

`AEG-1007`'s help MUST name the fix: convert the file to LF endings, or to CRLF consistently. A lone CR is almost always an artifact of a mangled merge or an editor misconfiguration, and saying so saves the author a search.

## Warnings and advisories (AEG-2xxx)

| Code | Message |
|---|---|
| 2010 | irreversible high-criticality capability has no human gate |
| 2020 | `default permit` is fail-open and will be highlighted in the audit report |
| 2021 | `first_applicable` is order-sensitive; prefer an order-independent algorithm |
| 2030 | citation refers to a superseded clause version |
| 2040 | rule is unreachable; here is a witness |
| 2041 | rule is subsumed by an earlier rule |
| 2042 | rules contradict: identical condition, opposing effects |
| 2050 | coverage gap; here is a request no rule matches |
| 2060 | declaration is never used |
| 2070 | obligation cannot be discharged by any known enforcement point |
| 2080 | data class may reach a permit path without a redaction obligation |
| 2090 | doc comment missing in strict mode |
| 2091 | doc comment does not precede a declaration |
| 2100 | advisory suppressed here; this suppression will appear in the audit report |
| 2106 | static resource bound is within 10% of the configured budget |

Under `--strict` every `2xxx` advisory is escalated to an error (`docs/02` section 11).

`AEG-2090` requires a doc comment on **every `export`ed declaration and every `policy`**, and on nothing else. Rules, tests, suites, and non-exported declarations are exempt: the audit report renders exported declarations and policies, so those are the ones whose prose an auditor will read, and demanding a doc comment on every rule would train authors to write filler.

`AEG-2091` fires where a doc comment does not immediately precede a declaration. The lexer only marks trivia as `doc`; the parser decides whether it landed anywhere useful.

## Structural, declaration, and syntax (AEG-3xxx)

| Code | Message |
|---|---|
| 3001 | missing `specification` declaration |
| 3002 | missing `package` declaration |
| 3003 | package name does not match directory path |
| 3010 | circular import (full cycle shown) |
| 3020 | required capability field missing |
| 3021 | duplicate tool name |
| 3022 | duplicate declaration identifier |
| 3023 | a three-letter uppercase name is reserved for a currency code |
| 3024 | schema name must be one of the nine request roots |
| 3025 | import alias collides with a local declaration identifier |
| 3026 | schema for this root is already declared by an imported package |
| 3030 | policy does not declare a combining algorithm |
| 3031 | policy does not declare `applies_to` |
| 3032 | policy declares no rules |
| 3040 | duplicate rule identifier in policy |
| 3041 | denying or escalating rule requires a `reason` |
| 3050 | obligation missing an `on <effect>` block or `on_failure` |
| 3060 | release build blocked: a policy test is failing |
| 3070 | expected X, found Y |
| 3080 | illegal character in quoted name |
| 3081 | quantifier nesting exceeds depth 3 |
| 3082 | import graph exceeds depth 32 |
| 3083 | quoted name exceeds 256 characters |

`AEG-3070` is the generic syntax error and is owned by the parser. Its summary MUST name both the expected construct and what was found; "parse error" and "unexpected token" are forbidden. Before this amendment the parser had no code to emit at all, which meant no parser diagnostic could ship. Its recovery behaviour uses the normative synchronisation token set in `docs/03` section 0.8.

### AEG-3070 shapes with required help text

Some syntax errors have a predictable cause, and a generic message wastes the one chance to explain it.

| Shape found | Required help text |
|---|---|
| `<number> % <number>` | ``%`` forms a percent literal; AEGIS has no modulo operator |
| `<number> <ident>` where the ident is a duration unit with a space | remove the space: a duration is one token, e.g. `5m`, not `5 m` |
| `a < b < c` | comparison is non-associative; write `a < b and b < c` (see `AEG-4120`) |
| `quant <ident> in` with no `(` | quantifier bodies are parenthesised: `count(r in c : p)` |
| `decision` outside `expect decision stable` | `decision` is legal only in a test expectation; obligations attach with `on permit` or `on deny` |
| `;` | AEGIS has no statement terminator; delete it (see `AEG-1005`) |
| `<<` `>>` | AEGIS has no shift or stream operators |
| `**` | AEGIS has no exponentiation; it is the shortest route to unbounded magnitude (I11) |
| `++` | AEGIS has no increment; there is no mutable state |
| `=>` `->` | AEGIS has no lambdas, because it has no user-defined functions |
| `::` | package paths use `.`, e.g. `std.eu_ai_act` |

`AEG-3022` is scoped to the local compilation unit. Two packages may each declare the same identifier; a package namespaces its declarations. `AEG-3025` covers the one cross-boundary case that is genuinely ambiguous, an import alias that collides with a local name. `AEG-3026` covers the other, a schema for a root an import already declared - schemas do not merge, because a root whose type depends on the import set breaks I2.

## Type and semantic (AEG-4xxx)

| Code | Message |
|---|---|
| 4010 | attribute is not declared in any schema (did you mean ...) |
| 4011 | declaration shadows a predeclared identifier |
| 4012 | Optional binding is not in scope here |
| 4013 | Optional binding shadows a keyword, a prelude name, or an enclosing binding |
| 4020 | test `given` value does not match the schema type |
| 4101 | currency mismatch in comparison |
| 4102 | cannot compare values of different enum types |
| 4103 | regex construct not supported by RE2 |
| 4110 | Optional value must be discharged before use |
| 4120 | comparison operators are non-associative |
| 4121 | logical operator requires Bool; there is no truthiness |
| 4130 | construct would require type-level computation and is forbidden |
| 4140 | unknown currency code |
| 4141 | duration outside the permitted range |
| 4160 | collection exceeds 4,096 elements |
| 4170 | concatenated string value exceeds 64 KiB |

The summary for `AEG-4101` is frozen as exactly `currency mismatch in comparison`. It was previously written three different ways across three documents.

`AEG-4140` and `AEG-4141` are check-time codes because currency validity and duration-call range are check-time facts. `AEG-4140` validates against the ISO 4217 table in `std.core`, which is versioned data with an explicit revision identifier, exactly like a clause library. `AEG-4141` MUST carry the same `= note:` text as `AEG-1019`, per the shared-note rule above: `30001d` and `duration(30001, d)` are one author mistake reported by two layers.

`AEG-4012`'s help MUST name both legal binding positions - the right operand of `and`, and the consequent of `implies` - because the author's next question is always "then where can I use it?". The scope rule is the recursive `binds()` definition in `docs/02` section 5.5.

**Why `AEG-4012` and `AEG-4013` are 4xxx and not 3xxx, recorded so it is not revisited.** The scope rule is decidable from the syntax tree, so it looks like a parser concern. It is not. Deciding whether a name is in scope requires an environment of live bindings, and building that environment *is* binding resolution, which lives in `check`. Putting these codes in the parser would force `parser` to track scopes, and `structure.md` forbids `parser` from importing `types` or `check`. The layering decides the range, not the flavour of the rule.

`AEG-4170` bounds the value of a string after adjacent literals concatenate. The lexical line limit `AEG-1011` bounds the physical line; this bounds the joined result, which is the first point at which the size of the value exists.

## Runtime (AEG-5xxx)

| Code | Message |
|---|---|
| 5001 | required request attribute missing; decision is Indeterminate, resolved to Deny |
| 5002 | request attribute type mismatch; decision is Indeterminate |
| 5010 | quantifier iteration cap reached |

## Loading (AEG-6xxx)

| Code | Message |
|---|---|
| 6001 | bad bytecode magic |
| 6002 | unsupported bytecode major version |
| 6003 | bytecode integrity hash mismatch |
| 6010 | bundle signature verification failed |
| 6011 | bundle references an unknown signing key |

## Retired and relocated codes

These numbers are burned. They MUST NOT be reused for any future defect, and an implementation MUST NOT emit them.

| Code | Was | Disposition |
|---|---|---|
| 1013 | quoted name exceeds 256 characters or contains illegal characters | **split and relocated.** Length is `AEG-3083`, character set is `AEG-3080`. Only the parser knows a string is a quoted name, and P-C outranks the convenience of keeping the number: nothing has shipped, so nothing depends on it. |
| 1015 | string literal exceeds 64 KiB | **retired as a lexical code.** The equivalent semantic limit on a concatenated string value is `AEG-4170`. |
| 1016 | collection exceeds 4,096 elements | **relocated** to `AEG-4160`; only the checker knows a collection's declared size. |
| 1017 | quantifier nesting exceeds depth 3 | **relocated** to `AEG-3081`; only the parser can count nesting. |
| 1018 | import graph exceeds depth 32 | **relocated** to `AEG-3082`; only the loader resolves the graph. |
| 1050 | unknown currency code | **relocated** to `AEG-4140`; the lexer cannot tell `EUR` from `Set`. |

Code numbers become immutable at first public release. Until then, a number that sits in the wrong range is a defect to fix, not a legacy to honour.

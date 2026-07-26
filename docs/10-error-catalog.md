# 10 - Error Catalogue

Every diagnostic has a permanent code. Codes are never reused, never renumbered, and are part of the conformance surface: a conforming implementation MUST emit the same code for the same defect. Any diagnostic without a catalogue entry fails CI.

## Ranges

| Range | Category |
|---|---|
| `AEG-1000`-`1999` | Lexical and lexical limits |
| `AEG-2000`-`2999` | Warnings and advisories |
| `AEG-3000`-`3999` | Structural, declaration, and syntax errors |
| `AEG-4000`-`4999` | Type and semantic errors |
| `AEG-5000`-`5999` | Runtime request errors |
| `AEG-6000`-`6999` | Bytecode and bundle loading |

**One defect, one code, one layer.** A diagnostic lives in the range of the layer that can actually detect it. Anything a one-token-lookahead scanner cannot see is not a `1xxx` code. Two codes retain numbers that predate this rule - `AEG-1013` is emitted by the parser and `AEG-1030` by the lexer on behalf of every layer - because a published code is never renumbered.

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

Severity is one of `error`, `warning`, `advisory`, `note`. A diagnostic without a `help` line is incomplete work. Never say "invalid", "unexpected", or "malformed" alone: say what was found, what was expected, and what to do.

## Lexical (AEG-1xxx)

| Code | Message | Notes |
|---|---|---|
| 1001 | invalid UTF-8 byte sequence | **fatal**, stops lexing; no replacement characters, ever |
| 1002 | bidirectional override character not permitted in source | anywhere in the file |
| 1003 | confusable character in string literal or quoted name | never in an identifier; identifiers are ASCII-only |
| 1004 | non-ASCII identifier not permitted | |
| 1005 | unexpected character | also covers illegal underscore placement in a numeric literal |
| 1006 | too many lexical errors, stopping | **fatal**, at 200 diagnostics per compilation unit |
| 1010 | source file exceeds 4 MiB | **fatal** |
| 1011 | line exceeds 4,096 bytes | measured in bytes |
| 1012 | identifier exceeds 128 bytes | `ident` and `TypeIdent` alike |
| 1013 | quoted name exceeds 256 characters | emitted by the parser; see `AEG-3080` for the character set |
| 1014 | numeric literal exceeds 38 significant digits | significance defined in `docs/02` section 1.2 |
| 1019 | duration outside the range 1 ms to 100 y | evaluated on the canonical millisecond value |
| 1030 | reserved keyword is forbidden in AEGIS | message MUST name the invariant or scope rule that forbids it |
| 1040 | unknown escape sequence | only `\"` `\\` `\n` `\t` exist |
| 1041 | unterminated string literal at end of line | strings are single-line |
| 1042 | unterminated string literal at end of file | |
| 1055 | malformed duration literal | unknown unit, or a letter or digit immediately after the unit |
| 1056 | duration magnitude must be an integer | `1.5h` |
| 1057 | exponent notation is not supported | `1e10` |

### Lexical diagnostic precedence - normative

Exactly one diagnostic per lexeme. First match wins; the rest are suppressed.

```
1001  ->  1002  ->  1004  ->  1005  ->  literal-form codes  ->  limit codes
                                        (1040 1041 1042
                                         1055 1056 1057)     (1011 1012
                                                              1014 1019)
```

Without a stated order, two conforming implementations would report different codes for the same byte, and diagnostic codes are part of the conformance surface.

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
| 3030 | policy does not declare a combining algorithm |
| 3031 | policy does not declare `applies_to` |
| 3032 | policy declares no rules |
| 3040 | duplicate rule identifier in policy |
| 3041 | denying or escalating rule requires a `reason` |
| 3050 | obligation missing `when`, `action`, or `on_failure` |
| 3060 | release build blocked: a policy test is failing |
| 3070 | expected X, found Y |
| 3080 | illegal character in quoted name |
| 3081 | quantifier nesting exceeds depth 3 |
| 3082 | import graph exceeds depth 32 |

`AEG-3070` is the generic syntax error and is owned by the parser. Its summary MUST name both the expected construct and what was found; "parse error" and "unexpected token" are forbidden. Before this amendment the parser had no code to emit at all, which meant no parser diagnostic could ship.

## Type and semantic (AEG-4xxx)

| Code | Message |
|---|---|
| 4010 | attribute is not declared in any schema (did you mean ...) |
| 4011 | declaration shadows a predeclared identifier |
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

The summary for `AEG-4101` is frozen as exactly `currency mismatch in comparison`. It was previously written three different ways across three documents.

`AEG-4140` and `AEG-4141` are check-time codes because currency validity and duration-call range are check-time facts. `AEG-4140` validates against the ISO 4217 table in `std.core`, which is versioned data with an explicit revision identifier, exactly like a clause library.

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
| 1015 | string literal exceeds 64 KiB | **retired.** Strings are single-line and `AEG-1011` bounds the line. One limit per axis. |
| 1016 | collection exceeds 4,096 elements | **relocated** to `AEG-4160`; only the checker knows a collection's declared size. |
| 1017 | quantifier nesting exceeds depth 3 | **relocated** to `AEG-3081`; only the parser can count nesting. |
| 1018 | import graph exceeds depth 32 | **relocated** to `AEG-3082`; only the loader resolves the graph. |
| 1050 | unknown currency code | **relocated** to `AEG-4140`; the lexer cannot tell `EUR` from `Set`. |

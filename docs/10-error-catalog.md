# 10 - Error Catalogue

Every diagnostic has a permanent code. Codes are never reused, never renumbered, and are part of the conformance surface: a conforming implementation MUST emit the same code for the same defect. Any diagnostic without a catalogue entry fails CI.

## Ranges

| Range | Category |
|---|---|
| `AEG-1000`-`1999` | Lexical and limits |
| `AEG-2000`-`2999` | Warnings and advisories |
| `AEG-3000`-`3999` | Structural and declaration errors |
| `AEG-4000`-`4999` | Type and semantic errors |
| `AEG-5000`-`5999` | Runtime request errors |
| `AEG-6000`-`6999` | Bytecode and bundle loading |

## Rendering standard

```
error[AEG-4101]: cannot compare Money[EUR] with Money[USD]
  --> payments.aegis:31:12
   |
31 |     deny resource.amount > money(10_000, USD)
   |          ^^^^^^^^^^^^^^^   ------------------ this is Money[USD]
   |          |
   |          this is Money[EUR], declared in schema.aegis:12:3
   |
   = why: currency is part of the Money type, so a comparison across
          currencies has no defined meaning (spec section 4, rule 2)
   = help: convert explicitly, and record the rate for the auditor:
           deny resource.amount > convert(money(10_000, USD), to: EUR, rate: fx.eur_usd)
   = note: the conversion rate becomes part of the evidence record
```

Every diagnostic MUST have: a code, a one-line summary, a primary span, at least one secondary span where a second location is relevant, a `why` explaining the underlying reason, and a `help` with an actionable fix. Severity is one of error, warning, advisory, note.

## Lexical (AEG-1xxx)

| Code | Message |
|---|---|
| 1001 | invalid UTF-8 byte sequence |
| 1002 | bidirectional override character not permitted in source |
| 1003 | confusable character in identifier |
| 1004 | non-ASCII identifier not permitted |
| 1010 | source file exceeds 4 MiB |
| 1011 | line exceeds 4,096 bytes |
| 1012 | identifier exceeds 128 bytes |
| 1013 | quoted name exceeds 256 characters or contains illegal characters |
| 1014 | numeric literal exceeds 38 significant digits |
| 1015 | string literal exceeds 64 KiB |
| 1016 | collection exceeds 4,096 elements |
| 1017 | quantifier nesting exceeds depth 3 |
| 1018 | import graph exceeds depth 32 |
| 1019 | duration outside the range 1ms to 100y |
| 1030 | reserved keyword is forbidden in AEGIS |
| 1040 | unknown escape sequence |
| 1041 | unterminated string literal at end of line |
| 1042 | unterminated string literal at end of file |
| 1050 | unknown currency code |
| 1055 | malformed duration literal |

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
| 2100 | advisory suppressed here; this suppression will appear in the audit report |
| 2106 | static resource bound is within 10% of the configured budget |

## Structural (AEG-3xxx)

| Code | Message |
|---|---|
| 3001 | missing `specification` declaration |
| 3002 | missing `package` declaration |
| 3003 | package name does not match directory path |
| 3010 | circular import (full cycle shown) |
| 3020 | required capability field missing |
| 3021 | duplicate tool name |
| 3030 | policy does not declare a combining algorithm |
| 3031 | policy does not declare `applies_to` |
| 3032 | policy declares no rules |
| 3040 | duplicate rule identifier in policy |
| 3041 | denying or escalating rule requires a `reason` |
| 3050 | obligation missing `when`, `action`, or `on_failure` |
| 3060 | release build blocked: a policy test is failing |

## Type and semantic (AEG-4xxx)

| Code | Message |
|---|---|
| 4010 | attribute is not declared in any schema (did you mean ...) |
| 4020 | test `given` value does not match the schema type |
| 4101 | cannot compare Money of different currencies |
| 4102 | cannot compare values of different enum types |
| 4103 | regex construct not supported by RE2 |
| 4110 | Optional value must be discharged before use |
| 4120 | comparison operators are non-associative |
| 4121 | logical operator requires Bool; there is no truthiness |
| 4130 | construct would require type-level computation and is forbidden |

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

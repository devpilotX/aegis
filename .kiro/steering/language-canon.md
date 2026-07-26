---
inclusion: always
---

# Language Canon - Do Not Drift

Every example, test, document, and error message must match this canon exactly. Silent drift in keyword names or syntax is the most common way a language project becomes incoherent.

**This file is downstream of `docs/02-language-specification.md` (I10).** Where the two disagree, docs/02 is right and this file is stale - say so and fix it.

## Canonical sample - the reference program

```aegis
specification "1.0"
package acme.payments
import std.eu_ai_act as eu

export capability transfer_funds {
  tool         "payments.transfer"
  criticality  high
  reversible   false
  data_classes { pii, financial }
}

export principal reviewer {
  role  "finance.approver"
  scope tenant
  mfa   required
}

schema context { region : String, channel : String }
schema resource { amount : Money[EUR] }

policy eu_high_risk_payment_gate {
  combining  deny_overrides
  applies_to context.region in eu.member_states
             and action.capability == transfer_funds
  cites eu.article(6)
  cites eu.article(14)

  /// The model must sit within the permitted risk band.
  rule tier_bound {
    require model.risk_tier <= limited
    otherwise deny
      reason "Model risk tier exceeds the permitted band."
  }

  /// Approval must exist and must be fresh. Staleness is not approval.
  rule human_gate {
    deny action.capability == transfer_funds
    unless human.approved_by(reviewer) within 5m
      reason "Irreversible high-value action requires fresh human approval."
  }

  default deny

  on violation {
    halt
    audit.emit(severity: high, evidence: full_trace)
    notify("risk-oncall")
  }
}

export obligation attach_ai_disclosure {
  on permit when context.channel == "external" {
    disclose(text: eu.transparency_notice())
  }
  on_failure deny
  cites eu.article(50)
}

test "blocks large EU transfer without approval" {
  given {
    context.region  = "EU"
    resource.amount = money(25_000, EUR)
    human.approved  = false
  }
  expect deny
  expect rule human_gate fired
  expect decision stable
}
```

## Keyword sets - complete and closed, 77 words

Admission is governed by one rule, docs/02 §1.5.1: **a word is a keyword only if it appears in a syntactic position where an identifier could not appear.** Everything else is a predeclared identifier or an enum member. Do not add a keyword; check the rule.

**Structural (5):** `specification` `package` `import` `as` `export`
**Declaration (12):** `policy` `rule` `capability` `principal` `resource_class` `obligation` `advice` `schema` `enum` `const` `test` `suite`
**Effect (11):** `allow` `deny` `require` `permit` `escalate` `redact` `throttle` `halt` `otherwise` `unless` `when`
**Combining (8):** `combining` `deny_overrides` `permit_overrides` `first_applicable` `only_one_applicable` `unanimous` `deny_unless_permit` `permit_unless_deny`
**Targeting (5):** `applies_to` `cites` `on` `violation` `default`
**Logic (17):** `and` `or` `not` `implies` `xor` `in` `contains` `matches` `if` `then` `else` `forall` `exists` `count` `any` `all` `none`
**Temporal (7):** `within` `before` `after` `since` `until` `during` `now`
**Values (3):** `true` `false` `some`
**Binding and assertion (9):** `to` `reason` `given` `expect` `fired` `stable` `is` `on_failure` `decision`

`none` is one word with one kind, read by position. `decision` is contextual and legal only in `expect decision stable`.

**Not keywords.** The nine request roots `subject action resource context model evals trace human clock` are predeclared identifiers; shadowing one is `AEG-4011`. So are `money` `duration` `percent` `convert` `eval` `card` `is_some` `is_none` `audit` `notify` `disclose`. Field labels `tool criticality reversible data_classes description role scope mfa jurisdiction retention action` are identifiers matched by position. Enum members `low medium high critical`, `workspace tenant global`, `required optional` are identifiers.

**Reserved-forbidden (29)** - lexes as one reserved kind, always errors with `AEG-1030`, exists to protect the design from future pressure:

`macro` `template` `extends` `abstract` `async` `await` `yield` `spawn` `import_dynamic` `unsafe` `native` `loop` `while` `recurse` `mut` `ref` `ptr` `type` `fixture` `set` `target` `where` `oblige` `always` `eventually` `at` `for` `ago` `between`

Each of these has required `= help:` text in `docs/10`. A bare "reserved keyword" message is incomplete work.

## Rule desugaring - normative

All surface forms reduce to one core node.

| Surface | Core condition | Core effect |
|---|---|---|
| `deny C unless G` | `C and not G` | `Deny` |
| `require C otherwise E` | `not C` | `E` |
| `allow C when G` | `C and G` | `Permit` |

Core form: `Rule(id, condition: Expr[Bool], effect, reason, obligations)`

## Expression precedence, lowest to highest

| # | Operators | Associativity |
|---|---|---|
| 1 | `implies` | right |
| 2 | `or` `xor` | left |
| 3 | `and` | left |
| 4 | `not` | prefix |
| 5 | `==` `!=` `<` `<=` `>` `>=` | **non-associative** |
| 6 | `in` `contains` `matches` `is` | non-associative |
| 7 | `within` `before` `after` `since` `until` `during` | non-associative |
| 8 | `+` `-` binary | left |
| 9 | `*` `/` | left |
| 10 | `-` unary | prefix |
| 11 | member access, call, index, `%` | postfix |

Comparison is deliberately non-associative. `a < b < c` is error `AEG-4120`, not a silently wrong expression.

## Syntax that is easy to get wrong

- **Quantifier bodies are parenthesised:** `count(r in resource.reviewers : r.role == "legal.approver") >= 2`. Without the parentheses the body swallows the comparison.
- **Optional discharge is `is`:** `x is none`, or `x is some v` which binds and narrows `v`.
- **`money(...)` is a call**, not a literal. `85%` is two tokens. `30d` is one token.
- **Adjacent string literals concatenate** at parse time, which is how long prose fits inside the 4,096-byte line limit.
- **A schema's name is a request root:** `schema resource { ... }`. `schema request` is `AEG-3024`.
- **`action.capability` is a capability reference**, never a String.
- **There is no `;`**. There is no unary `!`. There is no `between`, no `ago`, no exponent notation.

## Nine normative type rules

1. No implicit conversion, ever.
2. Currency is part of the `Money` type. `Money[EUR]` and `Money[USD]` are unrelated types.
3. No floating point. `Decimal` with 38 significant digits.
4. No null. `Optional[T]` with mandatory explicit discharge.
5. Comparisons are non-associative.
6. Logical operators accept `Bool` only. No truthiness (`AEG-4121`).
7. Enums are nominal and ordered. Cross-enum comparison is `AEG-4102`.
8. `Percent <: Decimal` is the only subtyping relation in the language.
9. Bidirectional checking, local inference only. No global inference, no type-level computation (`AEG-4130`).

Type names are `TypeIdent`, `[A-Z][A-Za-z0-9_]*`, with square-bracket arguments: `Set[T]`, `Optional[T]`, `Enum[E]`, `Money[EUR]`. Angle brackets do not exist. Any three-letter uppercase name is reserved for a currency (`AEG-3023`).

## Source representation

Source is valid UTF-8 and is **never normalised** - not NFC, not anything. Spans are half-open, 0-based, raw file bytes. Rendered line and column are 1-based and the column counts Unicode scalar values. Comments and whitespace are trivia retained on the following token, so tokens plus trivia reprint the source byte for byte.

## Request object roots - closed set

`subject` `action` `resource` `context` `model` `evals` `trace` `human` `clock`

Nothing else. An undeclared attribute is `AEG-4010` with a did-you-mean suggestion.

## The four decisions

`Permit` `Deny` `NotApplicable` `Indeterminate`

## Seven combining algorithms

Six are monoids over the decision domain. `first_applicable` takes an ordered list, is order-sensitive, is **not** a monoid, and always emits warning `AEG-2021`.

Identities: `NotApplicable` for four of them, then `Deny` for `deny_unless_permit`, then `Permit` for `permit_unless_deny`.

## Hard limits - normative, all inclusive maxima

A value equal to the limit is legal; exceeding it is the diagnostic.

| Limit | Value | Code | Layer |
|---|---|---|---|
| Source file | 4 MiB | 1010 | lexer |
| Line | 4,096 bytes | 1011 | lexer |
| Identifier | 128 bytes | 1012 | lexer |
| Decimal significant digits | 38 | 1014 | lexer |
| Duration | 1 ms to 100 y | 1019 | lexer |
| Diagnostics per file | 200 | 1006 | lexer |
| Diagnostics per build | 2,000 | 0001 | driver |
| Quoted name | 256 chars, `[A-Za-z0-9_./:-]` | 3083, 3080 | parser |
| Quantifier nesting depth | 3 | 3081 | parser |
| Import graph depth | 32 | 3082 | loader |
| Collection cardinality | 4,096 | 4160 | checker |
| Concatenated string value | 64 KiB | 4170 | checker |

`y` = 365 d exactly. `w` = 7 d exactly. No calendar arithmetic, because calendars are not deterministic.

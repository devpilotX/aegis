---
inclusion: always
---

# Language Canon - Do Not Drift

Every example, test, document, and error message must match this canon exactly. Silent drift in keyword names or syntax is the most common way a language project becomes incoherent.

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

policy eu_high_risk_payment_gate {
  combining  deny_overrides
  applies_to context.region in eu.member_states
             and action.capability == transfer_funds
  cites eu.article(6)
  cites eu.article(14)

  rule tier_bound {
    require model.risk_tier <= limited
    otherwise deny
      reason "Model risk tier exceeds the permitted band."
  }

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

## Keyword sets - complete and closed

**Structural:** `specification` `package` `import` `as` `export`

**Declaration:** `policy` `rule` `capability` `principal` `resource_class` `obligation` `advice` `schema` `enum` `const` `set` `type` `test` `suite` `fixture`

**Effect:** `allow` `deny` `require` `permit` `oblige` `escalate` `redact` `throttle` `halt` `otherwise` `unless` `when` `where`

**Combining:** `combining` `deny_overrides` `permit_overrides` `first_applicable` `only_one_applicable` `unanimous` `deny_unless_permit` `permit_unless_deny`

**Targeting:** `applies_to` `scope` `target` `cites` `on` `violation` `default`

**Logic:** `and` `or` `not` `implies` `xor` `in` `contains` `matches` `between` `if` `then` `else` `forall` `exists` `count` `any` `all` `none`

**Temporal:** `within` `before` `after` `since` `until` `during` `always` `eventually` `at` `for` `ago` `now`

**Values:** `true` `false` `some` `none` `money` `duration` `percent`

**Reserved-forbidden** - lexes as a keyword, always errors with `AEG-1030`, exists to protect the design from future pressure: `macro` `template` `extends` `abstract` `async` `await` `yield` `spawn` `import_dynamic` `unsafe` `native` `loop` `while` `recurse` `mut` `ref` `ptr`

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
| 6 | `in` `contains` `matches` `between` | non-associative |
| 7 | `within` `before` `after` `since` `until` `during` | non-associative |
| 8 | `+` `-` | left |
| 9 | `*` `/` | left |
| 10 | member access, call, index | postfix |

Comparison is deliberately non-associative. `a < b < c` is error `AEG-4120`, not a silently wrong expression.

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

## Request object roots - closed set

`subject` `action` `resource` `context` `model` `evals` `trace` `human` `clock`

Nothing else. An undeclared attribute is `AEG-4010` with a did-you-mean suggestion.

## The four decisions

`Permit` `Deny` `NotApplicable` `Indeterminate`

## Seven combining algorithms

Six are monoids over the decision domain. `first_applicable` takes an ordered list, is order-sensitive, is **not** a monoid, and always emits warning `AEG-2021`.

Identities: `NotApplicable` for four of them, then `Deny` for `deny_unless_permit`, then `Permit` for `permit_unless_deny`.

## Hard limits - normative

| Limit | Value |
|---|---|
| Source file | 4 MiB |
| Line | 4,096 bytes |
| Identifier | 128 bytes |
| Quoted name | 256 chars matching `[A-Za-z0-9_./:-]{1,256}` |
| Decimal significant digits | 38 |
| String literal | 64 KiB |
| Collection cardinality | 4,096 |
| Quantifier nesting depth | 3 |
| Import graph depth | 32 |
| Duration range | 1 ms to 100 y |

`y` = 365 d exactly. `w` = 7 d exactly. No calendar arithmetic, because calendars are not deterministic.

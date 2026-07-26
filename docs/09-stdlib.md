# 09 - Standard Library

The standard library is data and pure functions only. It performs no I/O and adds no expressive power beyond the core language.

## The prelude

Every compilation unit is compiled in a prelude scope containing these predeclared identifiers. They are lexed as ordinary identifiers, not keywords, per the admission rule in `docs/02` section 1.5.1. Shadowing any of them is `AEG-4011`.

| Group | Names |
|---|---|
| Request roots (closed set of 9) | `subject` `action` `resource` `context` `model` `evals` `trace` `human` `clock` |
| Constructors and pure functions | `money` `duration` `percent` `convert` `eval` `card` `is_some` `is_none` |
| Obligation and effect namespaces | `audit` `notify` `disclose` |

### Predeclared enums

The values that declaration fields accept are members of these enums, resolved nominally by the checker. They are identifiers, never keywords.

| Enum | Ordered members | Used by |
|---|---|---|
| `criticality` | `low` `medium` `high` `critical` | `capability.criticality` |
| `principal_scope` | `workspace` `tenant` `global` | `principal.scope` |
| `mfa_requirement` | `required` `optional` | `principal.mfa` |

`principal_scope` is named for the enum, not for the field, so that the field label `scope` and the enum type do not collide in one namespace.

## Currency table

Currency codes are ISO 4217 alpha-3. The table is **versioned data with an explicit revision identifier**, exactly like a clause library, and is populated in Phase 4 rather than Phase 1:

```
iso4217:2024-01-01
```

An unknown code passed to `money(...)` or `convert(..., to:)` is `AEG-4140`, raised by the checker. The lexer performs no currency validation of any kind: `EUR` and `Set` are the same lexical class and a scanner cannot tell them apart.

## `std.core`

| Symbol | Type | Notes |
|---|---|---|
| `money(n, CUR)` | `(Decimal, Currency) -> Money[CUR]` | The only Money constructor. Unknown `CUR` is `AEG-4140`. |
| `convert(m, to:, rate:)` | `(Money[A], Currency, Decimal) -> Money[B]` | Rate is an attribute; recorded in evidence |
| `duration(n, unit)` | `(Int, Unit) -> Duration` | `y` = 365d, `w` = 7d exactly. Out of range is `AEG-4141`. |
| `percent(n)` | `Decimal -> Percent` | The `85%` form is the same value, built by the parser |
| `card(s)` | `Set[T] -> Int` | Cardinality |
| `is_some(o)` / `is_none(o)` | `Optional[T] -> Bool` | Predicates only. They do **not** narrow; use `is some v` for that. |

## `std.eval`

| Symbol | Returns | Notes |
|---|---|---|
| `eval(name)` | Record with `.score: Decimal`, `.age: Duration`, `.suite: String` | Resolved by the PIP; never computed here |

Freshness is why `.age` exists. A passing score from six months ago is not assurance.

## `std.human`

| Symbol | Returns | Notes |
|---|---|---|
| `human.approved_by(p)` | `Bool` | Combine with `within D` for freshness |
| `human.reviewer_count()` | `Int` | For segregation-of-duties rules |

## `std.audit`

| Symbol | Kind | Notes |
|---|---|---|
| `audit.emit(severity:, evidence:)` | Obligation action | `evidence: full_trace` records the whole trace |
| `notify(target)` | Obligation action | Target is a declared channel |
| `disclose(text:)` | Obligation action | For Article 50 transparency |
| `redact(field)` | Effect | Removes a field before hashing, records the redaction |
| `throttle(rate:)` | Effect | Bounds action frequency |
| `halt` | Effect | Stops the agent run |

## Clause libraries

| Package | Contents |
|---|---|
| `std.eu_ai_act` | `article(n)`, `annex(n)`, `member_states`, `transparency_notice()`, risk-tier enum |
| `std.nist_ai_rmf` | `subcategory(id)`, function enums |
| `std.iso42001` | `clause(id)`, `annex_a(id)` |
| `std.gdpr` | `article(n)`, special-category data classes |
| `std.soc2` | `criterion(id)` |

Every clause entry carries an identifier, a version, an effective date, a short title, and provenance. Citing a superseded version produces warning `AEG-2030`.

## Rules for the standard library

No I/O. No clock reads. No randomness. No expressive power beyond the core. Every symbol documented with its type, failure modes, and the spec section that defines it. Every clause entry reviewed for accuracy before release, because a wrong article number in a governance tool is worse than no citation at all.

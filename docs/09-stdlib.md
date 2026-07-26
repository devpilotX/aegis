# 09 - Standard Library

The standard library is data and pure functions only. It performs no I/O and adds no expressive power beyond the core language.

## `std.core`

| Symbol | Type | Notes |
|---|---|---|
| `money(n, CUR)` | `(Decimal, Currency) -> Money[CUR]` | The only Money constructor |
| `convert(m, to:, rate:)` | `(Money[A], Currency, Decimal) -> Money[B]` | Rate is an attribute; recorded in evidence |
| `duration(n, unit)` | `(Int, Unit) -> Duration` | `y` = 365d, `w` = 7d exactly |
| `percent(n)` | `Decimal -> Percent` | |
| `card(s)` | `Set[T] -> Int` | Cardinality |
| `is_some(o)` / `is_none(o)` | `Optional[T] -> Bool` | Narrowing predicates |

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

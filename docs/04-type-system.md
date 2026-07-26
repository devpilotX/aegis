# 04 - Type System

## Type lattice

```
                        Any (internal only, not writable)
     Bool   String   Timestamp   Duration   Set[T]   Record{...}   Optional[T]
                              Decimal
                                 |
                              Percent
                              Money[CUR]      (CUR is part of the type)
                              Enum[E]         (nominal, ordered)
                              Capability      (nominal reference)
                              Principal       (nominal reference)
```

`Percent <: Decimal` is the only subtyping relation between base types. `Money[CUR]` is invariant in `CUR`: there is no subtyping between currencies, ever.

Type names are written with `TypeIdent` (`docs/03` section 0.2) and type arguments use **square brackets**: `Enum[E]`, `Set[T]`, `Optional[T]`, `Money[EUR]`. Angle brackets do not exist anywhere in AEGIS. A record type is written `Record{ name: Type, ... }` and has a real grammar production.

**Capability and Principal are nominal reference types, not strings.** `action.capability` has type `Capability` and compares only against a declared `capability` identifier. `action.capability == "payments.transfer"` is a type error, not a shortcut: the quoted form is the `tool` field of a capability, and comparing an action to a tool name would let a policy pass on a string that no declaration governs. `principal` references behave the same way in `escalate to` and `human.approved_by(...)`.

Unary minus (`docs/02` section 5.1) maps `Money[CUR] -> Money[CUR]`, `Decimal -> Decimal`, and `Percent -> Decimal`.

## The nine normative rules

Restated from `02` section 4, with rationale.

| # | Rule | Why |
|---|---|---|
| 1 | No implicit conversion, anywhere | Silent conversion in a legal artifact is a silent correctness bug |
| 2 | Currency is part of the Money type | Cross-currency comparison must be a compile error, not a runtime surprise |
| 3 | No floating point | `0.1 + 0.2 == 0.3` must hold; floats break determinism across platforms (I2) |
| 4 | No null; `Optional[T]` with explicit discharge | A null dereference in an evaluator would violate I4 |
| 5 | Comparisons are non-associative | Policy text is read by humans; silent misparse is unacceptable |
| 6 | Logical operators accept only Bool | Truthiness coercion hides bugs |
| 7 | Enums are nominal and ordered | `risk_tier <= limited` needs a defined order; cross-enum comparison is nonsense |
| 8 | `Percent <: Decimal` | The only subsumption, and it is safe |
| 9 | Bidirectional checking, local inference only | Global inference produces unexplainable errors and unbounded checking cost |

## Bidirectional checking

Two modes. **Synthesis** (`infer`) computes a type from an expression. **Checking** (`check`) validates an expression against an expected type. Literals, paths, and calls synthesise. Rule conditions, obligation `when` clauses, and quantifier bodies are checked against `Bool`. Set literals are checked against an expected element type where one exists, and synthesise the least upper bound otherwise.

This gives precise, local error messages: the checker always knows what it expected and where that expectation came from, which is exactly what `docs/10-error-catalog.md` requires.

## Optional discharge

The discharge form is `is`, specified in `docs/02` section 5.5. Until that amendment the language's headline safety feature had no syntax.

```aegis
// Rejected: AEG-4110, resource.reviewer is Optional[Record{...}]
deny resource.reviewer.role == "finance.approver"

// Accepted: explicit absence test
deny resource.reviewer is none
  reason "An unassigned reviewer cannot approve anything."

// Accepted: presence test that binds and narrows
deny resource.reviewer is some r and r.role != "finance.approver"
  reason "The assigned reviewer does not hold the approver role."

// Accepted: quantification never sees an absent element
deny exists r in resource.reviewers : r.role == "finance.approver"
```

After `is some v`, the checker narrows `Optional[T]` to `T` for `v` within that branch only. `is_some(o)` and `is_none(o)` from `std.core` return Bool and do **not** narrow, which is precisely why the `is` form exists.

## Currency in the type

```aegis
// AEG-4101: currency mismatch in comparison
deny resource.amount > money(10_000, USD)

// Accepted: conversion is explicit and carries an auditable rate
deny resource.amount > convert(money(10_000, USD), to: EUR, rate: fx.eur_usd)
```

The rate is an attribute, resolved by the PIP, recorded in the evidence. Nothing about the conversion is implicit or invisible to an auditor.

A currency code is lexed as a `TypeIdent` and validated here, not in the lexer: an unknown code is `AEG-4140`, checked against the versioned ISO 4217 table in `std.core`.

## Soundness sketch

The core calculus is a total, first-order, effect-free expression language over a finite set of base types with bounded quantification. Progress and preservation follow by structural induction over the typing derivation; there are no recursive types, no fixpoints, no polymorphic recursion, and no type-level computation, so the induction is well-founded on expression size. Bounded quantification preserves termination because collection cardinality is statically capped and nesting depth is capped at 3.

Any proposed extension that introduces recursive types, higher-order functions, or type-level computation invalidates this argument and MUST be rejected (`AEG-4130`).

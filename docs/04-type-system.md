# 04 - Type System

## Type lattice

```
                        Any (internal only, not writable)
     Bool   String   Timestamp   Duration   Set[T]   Record{...}   Optional[T]
                              Decimal
                                 |
                              Percent
                              Money[CUR]      (CUR is part of the type)
                              Enum<E>         (nominal, ordered)
```

`Percent <: Decimal` is the only subtyping relation between base types. `Money[CUR]` is invariant in `CUR`: there is no subtyping between currencies, ever.

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

```aegis
// Rejected: AEG-4110
deny resource.reviewer.role == "finance.approver"

// Accepted: narrowing after an explicit check
deny exists r in resource.reviewers : r.role == "finance.approver"

// Accepted: explicit some/none handling
deny if resource.reviewer is none then true else false
```

After a `some` test, the checker narrows `Optional[T]` to `T` within that branch only.

## Currency in the type

```aegis
// AEG-4101: cannot compare Money[EUR] with Money[USD]
deny resource.amount > money(10_000, USD)

// Accepted: conversion is explicit and carries an auditable rate
deny resource.amount > convert(money(10_000, USD), to: EUR, rate: fx.eur_usd)
```

The rate is an attribute, resolved by the PIP, recorded in the evidence. Nothing about the conversion is implicit or invisible to an auditor.

## Soundness sketch

The core calculus is a total, first-order, effect-free expression language over a finite set of base types with bounded quantification. Progress and preservation follow by structural induction over the typing derivation; there are no recursive types, no fixpoints, no polymorphic recursion, and no type-level computation, so the induction is well-founded on expression size. Bounded quantification preserves termination because collection cardinality is statically capped and nesting depth is capped at 3.

Any proposed extension that introduces recursive types, higher-order functions, or type-level computation invalidates this argument and MUST be rejected (`AEG-4130`).

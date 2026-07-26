# 05 - Operational Semantics

## Decision algebra

The decision domain is the four-element set `D = { Permit, Deny, NotApplicable, Indeterminate }`. A decision result is a pair `(d, O)` where `O` is a multiset of obligations, plus a separate multiset of advice.

## Rule evaluation

For a core rule `Rule(id, condition, effect, reason, obligations)` and a request `q`:

```
condition(q) = true   ->  (effect, obligations)
condition(q) = false  ->  (NotApplicable, {})
condition(q) errors   ->  (Indeterminate, {})
```

A condition "errors" only for a missing required attribute or a request type mismatch. Nothing else can error, because the language is total, pure, and statically checked.

## The seven combining algorithms as total functions

Let `R` be a multiset of results.

```
deny_overrides(R)      = Deny            if Deny in R
                       = Indeterminate   if Indeterminate in R
                       = Permit          if Permit in R
                       = NotApplicable   otherwise

permit_overrides(R)    = Permit          if Permit in R
                       = Indeterminate   if Indeterminate in R
                       = Deny            if Deny in R
                       = NotApplicable   otherwise

first_applicable(L)    = first element of the ordered list L that is not NotApplicable
                       = NotApplicable   if none

only_one_applicable(R) = the unique applicable result, if exactly one exists
                       = Indeterminate   if more than one
                       = NotApplicable   if none

unanimous(R)           = d               if every applicable result equals d
                       = Indeterminate    if applicable results disagree
                       = NotApplicable    if none applicable

deny_unless_permit(R)  = Permit          if Permit in R
                       = Deny            otherwise

permit_unless_deny(R)  = Deny            if Deny in R
                       = Permit          otherwise
```

`first_applicable` takes a **list**, not a multiset. That is precisely why it is order-sensitive and why it always emits warning `AEG-2021`. It is not a monoid.

## Algebraic properties (normative, exhaustively tested)

| Algorithm | Commutative | Associative | Identity |
|---|---|---|---|
| `deny_overrides` | Yes | Yes | NotApplicable |
| `permit_overrides` | Yes | Yes | NotApplicable |
| `only_one_applicable` | Yes | Yes | NotApplicable |
| `unanimous` | Yes | Yes | NotApplicable |
| `deny_unless_permit` | Yes | Yes | Deny |
| `permit_unless_deny` | Yes | Yes | Permit |
| `first_applicable` | **No** | Yes | NotApplicable |

Six of the seven form monoids over `D` with `NotApplicable`, `Deny`, or `Permit` as identity. Commutativity and associativity are verified by exhaustive testing over all multisets of size <= 4, and by property test for larger sizes. A change that breaks either property is a specification violation.

## TLA+ obligations

The TLA+ model in Phase 13 MUST establish:

1. **Totality** - the evaluation algorithm always reaches a terminal state.
2. **Determinism** - the terminal state is a function of `(bundle, request)` alone.
3. **Commutativity and associativity** - for the six order-independent combiners.
4. **Fail-closed** - no reachable state maps `Indeterminate` to `Permit` at the enforcement boundary under default configuration.
5. **Justification completeness** - every decision state carries a non-empty decisive-rule set unless the result is the policy default.

## Temporal semantics

Temporal operators evaluate over the finite `trace` attribute and the injected logical clock `clock.now`. The trace is a bounded, ordered sequence of timestamped events supplied in the request. Because the trace is finite and supplied, temporal evaluation is total and requires no host clock read - I3.

`human.approved_by(reviewer) within 5m` means: there exists an event in the trace, of type approval, by a principal satisfying `reviewer`, whose timestamp is within 5 minutes before `clock.now`. Freshness is intrinsic to the operator, which is why approval staleness cannot be silently ignored.

## Obligation discharge

Obligations are collected only from rules that contributed to the final decision. The PEP MUST attempt each obligation. On failure it MUST apply the obligation's `on_failure` effect, which defaults to nothing and is required to be declared explicitly. An undischargeable obligation therefore always resolves to a declared outcome, and the default recommendation is `deny` - I7.

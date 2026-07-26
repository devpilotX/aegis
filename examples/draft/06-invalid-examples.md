# Deliberately Invalid Examples

**DRAFT.** See `README.md` in this directory. These snippets are the intended shape of `conformance/invalid/` cases, not finished cases. Each must produce the stated diagnostic and no other.

## AEG-4120 - comparison is non-associative

```aegis
deny model.risk_score < 0.5 < 0.9
```

## AEG-4101 - cross-currency comparison

```aegis
deny resource.amount > money(10_000, USD)   // resource.amount is Money[EUR]
```

## AEG-4121 - no truthiness

```aegis
deny resource.amount and context.region == "EU"
```

## AEG-4110 - undischarged Optional

```aegis
deny resource.reviewer.role == "finance.approver"   // reviewer is Optional
```

## AEG-3041 - denying rule without a reason

```aegis
rule silent_block { deny context.environment == "production" }
```

## AEG-3030 - policy without a combining algorithm

```aegis
policy p { applies_to true  rule r { deny false reason "x" } }
```

## AEG-1030 - forbidden reserved keyword

```aegis
rule r { while context.retries < 3 { deny true reason "x" } }
```

## AEG-1005 - unexpected character

```aegis
given { action.capability = delete_data; context.environment = "production" }
```

## AEG-4010 - undeclared attribute

```aegis
deny context.regoin == "EU"     // did you mean context.region?
```

## AEG-3081 - quantifier nesting too deep

```aegis
deny exists(a in x : exists(b in a.y : exists(c in b.z : exists(d in c.w : d.flag))))
```

## AEG-3024 - schema name is not a request root

```aegis
schema request { reviewers : Set[String] }
```

## AEG-3023 - three-letter uppercase name is reserved for a currency

```aegis
schema resource { code : EUR }
```

## AEG-2020 - fail-open warning (compiles, warns loudly)

```aegis
policy p { combining deny_overrides  applies_to true
           rule r { deny false reason "x" }  default permit }
```

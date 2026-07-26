# Draft examples - aspirational, not yet valid AEGIS

**Nothing in this directory compiles, and nothing here gates a phase.**

These five programs were written before the language had a frozen lexical and syntactic definition. The P0 audit read them against `docs/02-language-specification.md` and `docs/03-grammar.md` and found that every one of them is invalid for at least one reason. They are kept because they express the intent well and are the shape the finished examples should take, and they are quarantined because a corpus that does not compile is worse than no corpus: it teaches the wrong syntax to every reader and to every model.

They are rebuilt one at a time, moved back to `examples/`, and added to `conformance/valid/` as the frontend gains the capability to accept them. A file leaves this directory only when the toolchain compiles it.

## What was fixed already

`01-hello-deny.aegis` has had two defects corrected in place, because both were named explicitly in the adjudication and both are one-line changes:

- The `;` separators are gone. `;` is not in the language; a stray one is `AEG-1005`.
- `action.capability` now compares against a declared `capability` reference, not the string `"data.delete"`. `action.capability` has type `Capability`, and comparing it to a tool name would let a policy pass on a string that no declaration governs (`docs/04`).

## What is still wrong, by file

| File | Remaining defects |
|---|---|
| `01-hello-deny.aegis` | `default permit` is deliberate here and warns with `AEG-2020`; needs schemas for `context` before it can typecheck |
| `02-payments-human-gate.aegis` | needs `schema` declarations for every root it reads; `2m ago` must become `within 2m`; `enum risk_tier` shadows nothing but needs a schema field to bind to |
| `03-quantifiers-and-sets.aegis` | `schema request` is `AEG-3024`, must be `schema resource`; quantifier bodies need parentheses; `count(...) >= 2` must be written with the delimiter |
| `04-obligations-and-disclosure.aegis` | obligation must use `on permit { ... }` / `on deny { ... }`, not `when` + `action`; needs schemas |
| `05-money-and-currency.aegis` | `fx.eur_usd` uses a root that is not one of the nine; the conversion rate must arrive under a declared root such as `context` |

## The rule this directory exists to enforce

An example is documentation that executes. If it does not execute, it is not documentation - it is a plausible-looking lie, and in a governance language a plausible-looking lie about syntax will end up in someone's real policy.

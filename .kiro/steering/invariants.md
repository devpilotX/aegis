---
inclusion: always
---

# The Eleven Invariants - Absolute

These are not preferences. They are the definition of the language. A change request that violates one of them is refused, not negotiated. If asked to violate one, respond with:

**Invariant violation - refusing.**

Then name the invariant, explain the conflict in two sentences, and propose the nearest design that preserves it.

---

### I1 - Totality

Every AEGIS program terminates. This is proven statically at compile time, not enforced by a runtime timeout. No loops, no recursion, no unbounded iteration. Quantifiers range only over finite, bounded collections. A program that cannot be proven to terminate does not compile.

### I2 - Determinism

The same policy bundle and the same request produce byte-identical output on every platform, every architecture, and every run, forever. No map iteration order dependence. No wall-clock reads outside the injected `clock`. No locale sensitivity. No floating point. No randomness. No hash-seed variance.

### I3 - Purity

Evaluation performs no I/O. It cannot open a file, make a network call, read an environment variable, or consult a clock. All external facts arrive in the request object. Only the PIP is permitted to perform I/O, and it does so before evaluation begins.

### I4 - Total decisions

Every evaluation returns exactly one of four values: `Permit`, `Deny`, `NotApplicable`, `Indeterminate`. There is no fifth outcome, no exception, no crash, no null. The combining algorithms are total functions over this domain.

### I5 - Dual compilation

One source file compiles to two artifacts from the same AST: executable bytecode and a human-readable compliance document. They cannot drift, because a single source of truth produces both. If the prose generator cannot describe a construct, that construct is not allowed in the language.

### I6 - Evidence by construction

Every decision emits a signed, hash-chained evidence record as an inseparable part of evaluation. Evidence is not logging. It cannot be disabled, sampled, or made optional, because a decision without evidence is not a decision.

### I7 - Fail-closed

Ambiguity, missing data, exceeded bounds, verification failure, or internal error all resolve toward `Deny` or `Indeterminate`, never toward `Permit`. No reachable state maps `Indeterminate` to `Permit`. A policy that defaults to permit compiles, but warns loudly (`AEG-2020`).

### I8 - Explainability

Every decision carries the exact rule identifiers that determined it, their source spans, their human-written reasons, their regulatory clause citations, and the attribute bindings that made them fire. A decision you cannot explain is a bug.

### I9 - Zero runtime dependencies

The runtime is a single statically linked binary. `CGO_ENABLED=0`. No interpreter, no VM, no shared libraries, no container base image. It must run in a `FROM scratch` container. This is what "independent" means in practice, and it is provable with one command.

### I10 - Specification supremacy

The specification in `docs/` is the source of truth. When code and specification disagree, the specification wins and the code is a bug. When the specification is wrong, amend the specification first, in its own commit, then change the code. Never the reverse.

### I11 - Bounded resources

Every evaluation has statically known worst-case bounds on time, memory, and iterations. The compiler computes them and refuses to build a policy that exceeds its declared budget. Hard limits are normative and listed in `docs/02-language-specification.md` section 1.2.

---

## Invariant ownership by component

| Component | Must uphold |
|---|---|
| lexer | I1, I2, I11 |
| parser | I1, I8, I10 |
| semantics / desugar | I1, I8, I10 |
| type system | I2, I4, I10 |
| static analysis | I1, I2, I7, I11 |
| IR / compiler | I2, I5, I11 |
| runtime / PDP | I2, I3, I4, I7, I8, I11 |
| evidence engine | I5, I6, I8 |
| CLI | I9, I2, I7 |
| LSP | I8, I2 |
| WASM / embedding | I2, I3, I9 |
| conformance | I10, I2 |

Every turn must open by naming which invariants the work touches.

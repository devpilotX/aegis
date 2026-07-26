---
inclusion: always
---

# Scope Discipline - The Rule That Saves The Project

## The rule, verbatim

> Phase 1 ships exactly three keywords - `allow`, `deny`, `require` - end to end. No fourth keyword until that vertical slice is complete.

"End to end" means: source text enters the lexer and a signed evidence record comes out the other side, with tests at every stage. Not "the parser handles it." All the way through.

## Why this is non-negotiable

Scope explosion is the number one killer of language projects, rated Critical in the risk register. The failure pattern is always the same: the author adds the tenth keyword before the first one works, the surface area outruns the test suite, nothing is ever finishable, and the project dies with 40,000 lines and no working binary.

A language with three keywords that compiles, evaluates, explains, and proves is infinitely more valuable than a language with sixty keywords that only parses.

## Feature admission test

Before adding any construct, all five must be true. Write the answers down.

1. **Regulatory anchor.** Name the specific regulation article, clause, or control that cannot be expressed without it.
2. **Captive-user demand.** Name the AgentProof / Veydria policy that needs it right now, not hypothetically.
3. **Invariant safety.** State which of the eleven invariants it touches and why it does not violate any.
4. **Prose expressibility.** Show the sentence the report generator will produce. If the generator cannot describe it, I5 forbids it.
5. **Bounded cost.** Show its worst-case time and memory bound.

If any answer is missing or hand-waved, the answer is no. Record the request in a deferred-features list and move on.

## Things that are permanently out of scope

Do not propose these. They are refused by design, not by omission.

- User-defined functions, macros, or templates
- Loops, recursion, or any unbounded iteration
- Any form of I/O during evaluation
- Mutable state
- Inheritance or trait systems
- Floating point arithmetic
- Null
- Self-hosting the compiler in AEGIS
- A package manager in v1
- Dynamic imports or runtime code loading
- Calendar-aware date arithmetic
- Regular expressions outside the RE2 subset
- A general-purpose standard library

## Per-turn discipline

- **One task per turn.** The active `tasks.md` is the queue. Work top to bottom.
- **No opportunistic refactoring.** Found something ugly next door? Note it in `RISK:` and leave it.
- **No speculative generality.** Build for the current task, not the imagined future one.
- **Commit at the end of every task.** Small commits are how you survive week twenty.
- If a task turns out to need more than roughly 400 lines of new code, stop and say so. It is probably two tasks that the spec described as one.

## When you disagree with the spec

Say so explicitly, propose the amendment to `docs/`, and wait. Do not implement the better idea and mention it afterwards. I10 exists because a specification that lags the code is worse than no specification.

## The three death modes and their antidotes

| Death mode | Antidote |
|---|---|
| Scope explosion | The three-keyword rule, enforced every turn |
| Learning Go while designing a type system | v0 in TypeScript first, then translate with differential tests |
| Nobody ever uses it | AgentProof / Veydria as captive first user from day one |

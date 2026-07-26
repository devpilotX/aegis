# Review Prompts

Use these between tasks. Reviewing your own work with a fresh prompt catches more than re-reading the diff.

## 1. Invariant review (run after every task)

> Review the code I just wrote against the eleven invariants in `prompts/MASTER-PROMPT.md` section 2. For each invariant, state whether this change could possibly violate it and cite the specific lines that make you confident. If you cannot be confident, say so and name the test that would settle it. Do not tell me it is fine unless you can point at the reason.

## 2. Diagnostic quality review (after any diagnostic change)

> Here is a new diagnostic. Rewrite it as if the reader is a compliance officer who has never programmed. Then answer: does it have a code, a primary span, a secondary span where relevant, a `why` that explains the underlying reason rather than restating the rule, and a `help` with an actionable fix? Compare its quality honestly against an equivalent Rust or Elm error. If it is worse, say why and fix it.

## 3. Determinism review (after any change to evaluation, IR, or output)

> Enumerate every possible source of nondeterminism in this change: map iteration, floats, clock reads, environment reads, goroutine ordering, locale-sensitive comparison, unordered sets or record fields, hash-order dependence, and error ordering. For each, state where it appears or why it cannot. Then tell me which test would catch a regression.

## 4. Specification drift review (before every commit)

> Compare this change against `docs/02-language-specification.md` and `docs/03-grammar.md`. Does the implementation now do anything the specification does not describe, or describe anything it does not do? If either is true, the specification wins (I10). Produce the specification delta and the conformance case that pins the behaviour.

## 5. Test adequacy review

> For this component, list every input class: empty, minimal, maximal, one past the limit, malformed, Unicode edge cases, deeply nested, and adversarial. Which are untested? Which error path has no test? What bug could ship today without a single test failing? Write the missing test that most reduces risk.

## 6. Scope review (weekly)

> Compare what I built this week against the current phase's deliverables in the phase prompt. Did I build anything outside them? Did I add a keyword, a construct, or an option that is not in the frozen specification? If yes, tell me plainly and propose what to delete.

## 7. Simplification review (end of every phase)

> Read this component and identify the three things that could be deleted entirely without losing a documented requirement. Then identify the one abstraction that is carrying its weight and the one that is not. Argue for deletion, not addition.

## 8. Auditor review (after any report or evidence change)

> Read this generated audit report as a sceptical external auditor. What would you refuse to accept? What would you ask for that is missing? Where does the document overclaim? Is the word tamper-evident used correctly and is tamper-proof absent? Where does jargon leak in?

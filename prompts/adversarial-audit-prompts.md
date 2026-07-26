# Adversarial Audit Prompts

Use these to attack the project deliberately. A governance tool that has never been attacked by its own author is not trustworthy.

## 1. Break totality

> You are an attacker with commit access to a policy repository. Construct an AEGIS policy that does not terminate, or that takes so long to evaluate that the enforcement point times out and the system fails open. Try nested quantifiers at the cardinality limit, pathological regex, deep import graphs, and huge constant sets. For each attempt, state exactly which check stops you and where in the code it lives. If any attempt succeeds, that is a critical defect.

## 2. Break determinism

> Find any way to make two evaluations of the same bundle and request produce different bytes: platform differences, map iteration, decimal formatting, set ordering, record field ordering, timestamp precision, locale, string normalisation, or WASM versus native. Propose the smallest reproducer for each.

## 3. Break fail-closed

> Find a path where an error, an ambiguity, missing data, an unavailable PDP, a signature failure, a version mismatch, or an undischargeable obligation results in the action proceeding. Include configuration mistakes and SDK misuse. Anything you find is a critical defect.

## 4. Forge evidence

> You have write access to evidence storage but not to the signing key. Alter, insert, delete, or reorder records so that verification still passes. Then repeat with the signing key. State precisely what each capability lets you do and what the documentation currently claims. If the documentation claims more than is true, that is a defect.

## 5. Slip a fail-open policy past review

> Write a policy that looks strict to a reviewer but permits an action it should block. Use misleading rule names, a subtly wrong combining algorithm, an applies_to target that never matches, a subsumed rule, a coverage gap, and a plausible-looking suppression. For each, state which static analysis catches it. Anything uncaught is a missing analysis.

## 6. Crash the toolchain

> Construct inputs that panic, hang, or exhaust memory in the lexer, the parser, the checker, the analyser, the IR decoder, or the bytecode loader. Include truncated bytecode, absurd version numbers, out-of-range indices, and cyclic structures. Every finding becomes a fuzz seed.

## 7. Attack the citation layer

> Find a way to make the tool cite a regulatory provision that does not say what the policy claims. Include superseded versions, wrong article numbers, plausible-but-invented subsections, and citations that contradict the rule they are attached to. Then state which check catches each and whether `CITATION-NEEDED` would fire.

## 8. Attack the argument, not the code

> Argue, as convincingly as you can, that AEGIS should not exist: that Rego plus tooling is sufficient, that buyers will accept YAML and dashboards, that the language will never reach adoption, and that a solo builder cannot maintain a specification. Then state which of those arguments is strongest and what evidence would refute it. If the strongest argument cannot be refuted, that is the most important finding in this document.

## 9. Homoglyph and text attacks

> Attempt to make two policies that look identical to a human reviewer but behave differently, using identifiers, string content, and clause names. State which lexical check stops each attempt.

## 10. Supply chain

> Describe how you would compromise a deployed AEGIS bundle from outside: dependency substitution, unsigned bundle acceptance, key mismanagement, build non-reproducibility, or a compromised release artifact. For each, name the control in `docs/13-security-model.md` and say whether it is actually implemented or merely documented.

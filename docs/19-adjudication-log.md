# 19 - Adjudication Log

> **Status.** Living record. Append-only below the horizon rule; never rewrite a closed entry.

## Why this file exists

Every ruling in this project was made in conversation. Conversation is not durable: one session ended at a usage limit mid-task, and a second was resumed from a hand-written summary. Several rulings were reconstructed from memory rather than read, and at least one was applied twice with different wording.

A decision that exists only in conversation does not exist. This file is where a decision becomes real.

**The rule, now normative.** No specification change may be committed on the strength of a conversational ruling alone. The ruling is recorded here in the same commit, or the change waits.

**What belongs here.** Anything that resolves an ambiguity, narrows a guarantee, retires a construct, reverses an earlier position, or ratifies a deliberate deviation from an instruction. Implementation detail does not belong here; that is what commit messages and the task specs are for.

**What each entry must carry.** The question, the ruling, the reason, the commit that applied it, and - where one exists - the earlier position it replaced. An entry that records only the ruling is half an entry, because the next reader will re-litigate the reason.

---

## A. The P0 audit

The corpus was audited before any code existed. Twenty-nine defects were raised against the specification, the grammar, the catalogue, the examples, and the steering set. Five structural amendments were then applied across twelve files.

**A1. All five committed examples were invalid.** They used constructs the specification did not define and spelled others in retired forms. Ruling: examples are conformance surface, not illustration. They moved to a draft directory that the corpus checks exclude, and nothing returns to the published set until it tokenises and parses under the real front end.

**A2. The keyword set was internally inconsistent.** Eighty-five entries were listed, eighty-four were unique, one appeared twice, and eleven had no grammar production. Ruling: the keyword table and the grammar terminals are one artifact with two renderings, and disagreement between them is a build failure. The set was rebuilt from the productions upward: seventy-seven keywords, twenty-nine reserved-and-forbidden, zero overlap.

**A3. Three rendering standards coexisted** for diagnostics, in three documents, differing in gutter width and note prefix. Ruling: one canonical rendering, fixed by golden file, owned by the diagnostics spec. Any other document that shows a diagnostic quotes the golden file or shows nothing.

**A4. Four limits were described as lexical and are not lexically detectable.** Cardinality, quantifier nesting, import depth, and semantic string length cannot be enforced by a scanner that has not yet parsed anything. Ruling: they moved to the phase that can actually detect them. A limit assigned to a component that cannot see the violation is not a limit; it is a wish.

**A5. Unicode normalisation was specified and is now forbidden.** Normalising input changes byte offsets, which invalidates spans, which invalidates the hashes computed over them, which breaks the evidence chain and byte-exact round-tripping at once. Ruling: no normalisation of any kind, anywhere. Identifiers are compared as raw bytes. Confusable and bidirectional-control detection remains, as detection - it reports, it never rewrites.

**A6. Comment round-tripping was impossible as written.** Comments were trivia to be discarded and also content to be reproduced byte-exact. Ruling: trivia is retained, attached, and reproduced. The round-trip property covers tokens **and** trivia, which is why it is one of the eight mandatory properties rather than a testing nicety.

**A7. A percent was one token and also two.** Ruling: two tokens, a number and a postfix percent operator. The undecided form was struck.

**A8. Positions were zero-based in one document and one-based in another.** Ruling: spans are half-open and zero-based over bytes; rendering is one-based; columns count scalar values, and a tab counts as one. Internal representation and human presentation are different layers and were being conflated.

**A9. The target language for the first working phase contradicted itself.** Ruling: the throwaway front end is TypeScript, the real implementation is Go, and the TypeScript is thrown away rather than ported. Recorded so nobody later mistakes the scaffold for a deliverable.

---

## B. Rulings that reversed my own earlier instruction

These are the entries that matter most, because they are the ones a summary would quietly drop.

**B1. The optional-binding scope rule was broken and was replaced.** My rule was positional: a binding was in scope for everything to its right. That fails under left-associative parsing, which is what the grammar specifies - the association order means "to the right" is not a well-defined region of the tree.

Ruling: scope is the recursive set of names an expression binds, computed bottom-up. Implication is a scope barrier. A name used outside that set is one error, a name bound twice within a union is a different error, and both live in the semantic range rather than the lexical one.

The corollary took a second pass to get right: the duplicate case is **not** shadowing. It is two branches of a union contributing the same name, so the merged set is ambiguous. The catalogue summary still says shadows; that is a recorded finding.

**B2. A guarantee I introduced contradicted one already in the specification.** I required that no token stream be produced for a fatal input. The specification already guaranteed exactly one end-of-file token on every path. Both cannot hold.

Ruling, by splitting the cases: a fatal detected **before** scanning begins produces no stream at all, not even an end marker, because there is no valid byte sequence to scan. A fatal detected **during** scanning produces the partial stream, terminated normally. The distinction is whether a stream ever legitimately existed.

Consequence, now a finding: the withdrawn always-one-end-marker wording survives in a source doc comment and in one task description. The corpus checks catch retired **codes** and retired **constructs**; a retired **prose guarantee** is a third drift class with no gate on it.

**B3. My severity constraint contradicted the catalogue.** I specified two severities; the catalogue defined four. Ruling: two severities, error and warning, with fatality as a separate orthogonal flag, and note demoted to a rendering element rather than a severity. Four severities where two carry meaning is three axes pretending to be one.

**B4. My ordering constraint contradicted the accepted design.** I required the sink to sort; the design had it preserve insertion order and defined sorting as a rendering concern. Ruling: the sink never sorts. It is a container with a cap, and reordering in a container makes the cap non-deterministic.

**B5. My line budgets counted enumeration data as logic.** A table of one hundred and thirty-eight token kinds is not one hundred and thirty-eight decisions. Ruling: budgets count logic lines only. Data tables, exhaustive mappings, and golden fixtures are exempt.

**B6. My toolchain floor was unsatisfiable.** The pinned package manager loads a standard-library module that the specified runtime does not ship, so the install could not succeed under any flag combination. Ruling: the floor rose to the version the package manager actually requires, and a corpus check now asserts that all four places recording that version agree. The failure mode was invisible for three attempts because the diagnostic lived in a job log that needs a token to read; check annotations do not.

**B7. Four adjudications in the risk review were wrong on the merits** - among them a string-length ceiling I derived from the wrong encoding assumption. All four were reversed. Recorded without detail because the reversals are in the specification; recorded at all because a reader deserves to know the review was fallible.

---

## C. Rulings that survived challenge

**C1. A five-or-six byte sequence is its own error class**, distinct from a generally invalid leader byte, because the byte ranges that once encoded longer sequences carry a specific and useful diagnostic. This required the class boundaries to be disjoint, which they initially were not - the same byte pair matched two classes, and a conforming implementation could report either code. Codes are conformance surface, so overlap is a defect. The boundary was fixed once. A second overlap in the adjacent range is a recorded finding.

**C2. Positions are derived lazily from a line index, and memoisation is forbidden.** Caching derived positions introduces state whose contents depend on access order, and determinism is an invariant rather than a goal. The cost is a logarithmic search plus a walk of one line, which is bounded because line length is bounded.

**C3. Byte-order-mark handling stays a separate pass from the null-byte scan**, and the two must not be folded together for speed. Folding them makes the diagnostic order depend on scan position rather than on the declared fatal chain.

**C4. The forbidden-word list is enforced by reverse closure, not by review.** Every code the catalogue defines must be referenced somewhere, and every code referenced must be defined. That check found three codes defined and never used, and two retired codes still cited - one of them in the file that teaches commit-message conventions.

**C5. Deliberate deviation is permitted and must be flagged.** An implementer who finds the specification wrong while implementing it should deviate on documented structural grounds and say so in the same turn. This has already paid for itself: implementing a spec surfaced a defect in that spec twenty minutes after it was committed, and a test expectation written by the implementer was itself wrong about a column number.

---

## D. Open items

**D1. The detection ledger does not exist.** The ruling was that any code emitted by an earlier task than the one that owns it must be recorded in a ledger, and that the owning task cannot close until the ledger is empty. Two codes are already in that state. The ledger was never written into the repository, which means the gate it creates is currently unenforced.

**D2. Commit authorship credits the wrong account.** The git identity is correct; the email is verified against a different account than the one that owns this repository.

**D3. No branch protection ruleset exists.** Eleven corpus and build checks run, and every one of them is advisory. A check that cannot block a merge is a report, not a gate.

**D4. One commit exists locally and was never pushed.** Three ratified rulings - the normalised fatal marker, the whole-file diagnostic location, and the sink fencing - are therefore absent from the published history, and any audit of the published tree describes superseded code.

---

## E. How to append

One heading per ruling, in the section it belongs to, with the question first and the reason last. If a ruling reverses an entry above, do not edit that entry: add the reversal and cross-reference it. The value of this file is that it shows the reasoning changing over time, and an edited record cannot show that.

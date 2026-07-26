# AEGIS — Complete Skills Catalogue

**Total skills: 1,042**, across 24 domains, each atomic, each individually verifiable.

---

## How to read this catalogue

Every skill is written so that you can answer **yes** or **no** to "can I do this right now, without help?" There is no partial credit and no "sort of".

Each skill carries three tags:

| Tag | Meaning |
|---|---|
| **[C]** Critical | The project fails without it. Non-negotiable. |
| **[I]** Important | Quality suffers materially without it. |
| **[N]** Nice | Improves polish, speed, or credibility. |

And a phase marker `P0`–`P13` indicating when it is first needed.

---

## Domain map

| # | Domain | Skills | File |
|---|---|---|---|
| 1 | Programming language theory foundations | 48 | `01-foundations.md` |
| 2 | Formal grammars and language definition | 42 | `01-foundations.md` |
| 3 | Lexical analysis | 40 | `01-foundations.md` |
| 4 | Parsing | 52 | `02-frontend.md` |
| 5 | Abstract syntax and IR design | 38 | `02-frontend.md` |
| 6 | Type systems | 56 | `02-frontend.md` |
| 7 | Semantic analysis and binding | 40 | `03-analysis.md` |
| 8 | Static analysis and verification | 54 | `03-analysis.md` |
| 9 | Formal methods | 44 | `03-analysis.md` |
| 10 | Compiler backend and code generation | 46 | `04-backend.md` |
| 11 | Virtual machine and runtime | 48 | `04-backend.md` |
| 12 | Determinism engineering | 36 | `04-backend.md` |
| 13 | Diagnostics and error engineering | 42 | `05-quality.md` |
| 14 | Testing and correctness | 58 | `05-quality.md` |
| 15 | Performance engineering | 40 | `05-quality.md` |
| 16 | Go engineering | 52 | `06-engineering.md` |
| 17 | TypeScript engineering | 34 | `06-engineering.md` |
| 18 | Build, release, distribution | 44 | `06-engineering.md` |
| 19 | Developer tooling and LSP | 42 | `07-ecosystem.md` |
| 20 | Security and cryptography | 48 | `07-ecosystem.md` |
| 21 | AI governance domain knowledge | 56 | `08-domain.md` |
| 22 | Regulatory and compliance literacy | 50 | `08-domain.md` |
| 23 | Agentic AI systems architecture | 44 | `08-domain.md` |
| 24 | Product, open source, and communication | 48 | `08-domain.md` |
| | **Total** | **1,042** | |

---

## The honest truth about 1,042 skills

You do not need all of them, and you do not need any of them before starting.

| Tier | Count | When | Reality |
|---|---|---|---|
| **Tier 1 — Blocking** | 87 | Before Phase 1 | You genuinely cannot start without these. Most you already have from web development. |
| **Tier 2 — Core** | 340 | Phases 1–7 | Learned *while building*, not before. This is the bulk of the real work. |
| **Tier 3 — Production** | 385 | Phases 8–13 | Needed to make it credible rather than a toy. |
| **Tier 4 — Excellence** | 230 | Post v1.0 | Separates a respected language from a merely working one. |

**The catalogue is a map, not a gate.** Read it to know what exists and what you are trading away when you skip something. Do not read it as a curriculum to complete before writing code. That path leads to eighteen months of study and zero shipped software.

---

## The 87 blocking skills

If you can do these, start Phase 1 today.

### Programming fundamentals (22)

1. Write and debug recursive functions over tree structures **[C] P0**
2. Reason about and implement a finite state machine **[C] P0**
3. Manipulate strings by byte offset, not character index **[C] P0**
4. Understand UTF-8 encoding: code points, code units, grapheme clusters **[C] P0**
5. Implement and reason about a hash map **[C] P0**
6. Implement and reason about a stack **[C] P0**
7. Implement a tree traversal (pre-order, post-order) **[C] P0**
8. Implement the visitor pattern over a tagged union **[C] P0**
9. Model data with tagged unions / discriminated unions **[C] P0**
10. Reason about algorithmic complexity in big-O terms **[C] P0**
11. Use a debugger with breakpoints and watch expressions **[C] P0**
12. Read a stack trace and locate the true origin of a fault **[C] P0**
13. Write a pure function and explain why purity matters **[C] P0**
14. Distinguish value semantics from reference semantics **[C] P0**
15. Handle errors as return values rather than exceptions **[C] P0**
16. Use immutable data structures deliberately **[C] P0**
17. Write a comparator producing a total order **[C] P0**
18. Serialise and deserialise structured data losslessly **[C] P0**
19. Reason about integer overflow and its consequences **[C] P0**
20. Explain why binary floating point cannot represent 0.1 exactly **[C] P0**
21. Use arbitrary-precision decimal arithmetic correctly **[C] P0**
22. Write code with no reliance on iteration order of a hash container **[C] P0**

### Language theory minimum (18)

23. Define a context-free grammar in EBNF **[C] P0**
24. Distinguish concrete syntax from abstract syntax **[C] P0**
25. Explain the difference between a token and a lexeme **[C] P0**
26. Explain operator precedence and associativity **[C] P0**
27. Explain what makes a grammar ambiguous **[C] P0**
28. Hand-trace a recursive-descent parse **[C] P0**
29. Explain what an AST node is and why spans are attached to it **[C] P0**
30. Explain the difference between syntax and semantic errors **[C] P0**
31. Explain what a symbol table is and why scoping requires one **[C] P0**
32. Explain static versus dynamic typing **[C] P0**
33. Explain type soundness informally **[C] P0**
34. Explain what an intermediate representation is for **[C] P0**
35. Explain the difference between a compiler and an interpreter **[C] P0**
36. Explain what a tree-walking evaluator is **[C] P0**
37. Explain what Turing completeness is and what it costs **[C] P0**
38. Explain what a total function is **[C] P0**
39. Explain why a total language enables exhaustive analysis **[C] P0**
40. Explain the halting problem and its relevance to policy languages **[C] P0**

### Toolchain (14)

41. Install and verify Node.js ≥ 20 **[C] P0**
42. Initialise a TypeScript project with strict mode enabled **[C] P0**
43. Configure `tsconfig.json` with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` **[C] P0**
44. Run TypeScript directly with `tsx` **[C] P0**
45. Write and run a Vitest test suite **[C] P0**
46. Read a code-coverage report and act on it **[C] P0**
47. Use Git branches, rebase, and atomic commits **[C] P0**
48. Write a conventional commit message **[C] P0**
49. Configure and use a linter and formatter **[C] P0**
50. Use a CLI argument parser **[C] P0**
51. Read and write files with explicit encoding **[C] P0**
52. Use `ripgrep` or equivalent to navigate a codebase **[C] P0**
53. Set up a CI pipeline that runs tests on push **[C] P0**
54. Install and authenticate Kiro CLI **[C] P0**

### Kiro CLI specifically (11)

55. Create `.kiro/steering/` documents and understand always-loaded context **[C] P0**
56. Write a Kiro spec with `requirements.md`, `design.md`, `tasks.md` **[C] P0**
57. Write EARS-format acceptance criteria **[C] P0**
58. Drive Kiro through a task list one task at a time **[C] P0**
59. Recognise when Kiro has drifted from the spec and correct it **[C] P0**
60. Use steering docs to enforce invariants across every generation **[C] P0**
61. Scope a spec so it is completable in one session **[C] P0**
62. Review generated code against acceptance criteria before accepting **[C] P0**
63. Maintain spec-to-code traceability **[C] P0**
64. Use file-match steering conditions to load context selectively **[I] P0**
65. Version steering docs alongside code **[I] P0**

### Domain minimum (12)

66. Explain what an AI agent is and how it differs from a chatbot **[C] P0**
67. Explain what a tool call is in an agent context **[C] P0**
68. Explain PEP, PDP, PIP, PAP and their separation **[C] P0**
69. Explain attribute-based access control **[C] P0**
70. Explain fail-open versus fail-closed and why fail-closed is the default **[C] P0**
71. Explain what human-in-the-loop means operationally **[C] P0**
72. Explain what an audit trail is and what makes it admissible **[C] P0**
73. Explain the EU AI Act risk tiers **[C] P0**
74. Explain what NIST AI RMF is at a functional level **[C] P0**
75. Explain what ISO/IEC 42001 certifies **[C] P0**
76. Explain what an AI evaluation suite measures **[C] P0**
77. Explain why governance rules in PDFs cannot be enforced **[C] P0**

### Judgement (10)

78. Say no to a feature that violates a stated invariant **[C] P0**
79. Ship a small complete thing rather than a large incomplete thing **[C] P0**
80. Write a specification before writing code **[C] P0**
81. Recognise scope creep within one working session **[C] P0**
82. Delete code you spent a week writing when the design changed **[C] P0**
83. Distinguish a design problem from an implementation bug **[C] P0**
84. Estimate a task and then measure your error afterwards **[C] P0**
85. Work from a written plan rather than improvising **[C] P0**
86. Read a specification document precisely and completely **[C] P0**
87. Ask "what would make this wrong?" before declaring it done **[C] P0**

---

## Skill acquisition strategy

| Method | Use for | Efficiency |
|---|---|---|
| Build the thing | Domains 3–7, 10–15 | Highest. Compiler skills are motor skills. |
| Read the primary source | Domains 1, 2, 6, 9 | High for theory that must be correct |
| Read others' implementations | Domains 4, 10, 11, 16 | High. Read OPA, CEL, Cedar, and TinyGo source. |
| Structured course | Domain 9 (formal methods) only | Slow but necessary for verification work |
| Reference documentation | Domains 21, 22 | Only method available. Read the actual regulations. |
| Deliberate practice | Domains 13, 24 | Error messages and writing improve only by iteration |

**Recommended reading, in priority order:**

1. *Crafting Interpreters*, Robert Nystrom — free online. Covers 60% of Domains 3–5, 10–11. Non-optional.
2. *Types and Programming Languages*, Benjamin Pierce — Chapters 1–11 and 22 only. Domain 6.
3. *Engineering a Compiler*, Cooper & Torczon — reference, not cover-to-cover.
4. Open Policy Agent source and Rego specification — the closest prior art. Read it entirely.
5. AWS Cedar language specification and its Lean formalisation — the gold standard for a verified policy language.
6. Google CEL specification — the gold standard for a total, embeddable expression language.
7. The EU AI Act, full text — Domain 22. Read the actual regulation, not summaries.
8. NIST AI RMF 1.0 and the Generative AI Profile — Domain 22.
9. *The Little Typer* — optional, for Domain 9 intuition.
10. TLA+ *Specifying Systems*, Lamport — Chapters 1–6 only, for Domain 9.

---

## Self-assessment gates

Do not proceed past a gate until you pass it.

| Gate | Before phase | Requirement |
|---|---|---|
| **G0** | Phase 1 | All 87 blocking skills answered yes |
| **G1** | Phase 4 | Domains 3–5 at ≥ 80% |
| **G2** | Phase 6 | Domain 6 at ≥ 85%; Domain 16 at ≥ 60% |
| **G3** | Phase 7 | Domains 10–12 at ≥ 80% |
| **G4** | Phase 8 | Domain 20 at ≥ 90% — cryptography errors are unrecoverable |
| **G5** | Phase 13 | Domain 9 at ≥ 70%; Domains 21–22 at ≥ 90% |

The assessment protocol is in `ASSESSMENT.md`.

---

## Domain files

- `01-foundations.md` — Domains 1–3 (130 skills)
- `02-frontend.md` — Domains 4–6 (146 skills)
- `03-analysis.md` — Domains 7–9 (138 skills)
- `04-backend.md` — Domains 10–12 (130 skills)
- `05-quality.md` — Domains 13–15 (140 skills)
- `06-engineering.md` — Domains 16–18 (130 skills)
- `07-ecosystem.md` — Domains 19–20 (90 skills)
- `08-domain.md` — Domains 21–24 (198 skills)
- `LEARNING-PATH.md` — ordered acquisition sequence
- `ASSESSMENT.md` — gate protocol and scoring
